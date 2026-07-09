import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Cuppon from "../models/cupponModel.js";
import sendEmail from "../utils/sendEmail.js";
import { calculateDynamicShipping } from "./shippingController.js";
import { createAndSendNotification } from "./notificationController.js";
import OrderTracking from "../models/orderTrackingModel.js";

// Helper function to calculate effective price (standard discount only)
const calculateEffectivePrice = (product, variantPrice = null) => {
  const basePrice = variantPrice || product.price || 0;
  const discountPercent = product.discountPercentage || 0;

  if (discountPercent > 0) {
    return basePrice - (basePrice * discountPercent) / 100;
  }

  return basePrice;
};

const calculateSavings = (product, variantPrice = null) => {
  const basePrice = variantPrice || product.price || 0;
  const discountPercent = product.discountPercentage || 0;
  return (basePrice * discountPercent) / 100;
};

const generateOrderId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, cupponCode } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    }

    const validMethods = [
      "Cash on Delivery",
      "bKash",
      "Nagad",
      "Rocket",
      "Bank",
      "SSLCommerz",
    ];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ msg: "Invalid payment method." });
    }

    const productIds = orderItems.map((x) => x._id || x.product);

    const itemsFromDB = await Product.find({
      _id: { $in: productIds },
    });

    const dbOrderItems = orderItems.map((itemFromClient) => {
      const clientId = (
        itemFromClient._id || itemFromClient.product
      )?.toString();

      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === clientId,
      );

      if (!matchingItemFromDB) {
        res.status(404);
        throw new Error(`Product not found: ${clientId}`);
      }

      let itemImage = matchingItemFromDB.images[0];
      let itemPrice = Number(matchingItemFromDB.price);
      let originalPrice = itemPrice;

      let variantInfo = {
        hasVariants: false,
        colorIndex: null,
        colorName: "",
        colorHex: "",
        sizeIndex: null,
        sizeName: "",
        variantPrice: null,
        sku: "",
      };

      if (
        itemFromClient.variantInfo?.hasVariants &&
        matchingItemFromDB.hasVariants
      ) {
        const { colorIndex, sizeIndex } = itemFromClient.variantInfo;

        if (colorIndex !== null && matchingItemFromDB.variants[colorIndex]) {
          const variant = matchingItemFromDB.variants[colorIndex];
          itemImage = variant.color.image || matchingItemFromDB.images[0];

          variantInfo.hasVariants = true;
          variantInfo.colorIndex = colorIndex;
          variantInfo.colorName = variant.color.name;
          variantInfo.colorHex = variant.color.hexCode || "";

          if (sizeIndex !== null && variant.sizes[sizeIndex]) {
            const sizeVariant = variant.sizes[sizeIndex];
            itemPrice = sizeVariant.price;

            variantInfo.sizeIndex = sizeIndex;
            variantInfo.sizeName = sizeVariant.size;
            variantInfo.variantPrice = sizeVariant.price;
            variantInfo.sku = sizeVariant.sku || "";

            if (sizeVariant.countInStock < itemFromClient.qty) {
              res.status(400);
              throw new Error(
                `Insufficient stock for ${matchingItemFromDB.name} - ${variant.color.name} / ${sizeVariant.size}`,
              );
            }
          }
        }
      }

      const finalPrice = calculateEffectivePrice(matchingItemFromDB, itemPrice);
      const appliedDiscountPercent = matchingItemFromDB.discountPercentage || 0;

      return {
        name: matchingItemFromDB.name,
        qty: Number(itemFromClient.qty) || 1,
        image: itemImage,
        price: originalPrice,
        finalPrice: finalPrice,
        product: matchingItemFromDB._id,
        category: matchingItemFromDB.category,
        discountPercentage: appliedDiscountPercent,
        weight: Number(matchingItemFromDB.weight) || 0.0,
        variantInfo: variantInfo,
        shippingDetails: matchingItemFromDB.shippingDetails || {
          isFreeShipping: false,
          isIndividualShipping: false,
          individualShippingCost: 0,
          extraShippingCost: 0,
        },
      };
    });

    // ==========================================
    //  CALCULATE BASE PRICES & DYNAMIC SHIPPING
    // ==========================================
    const itemsPrice = dbOrderItems.reduce(
      (acc, item) => acc + item.finalPrice * item.qty,
      0,
    );

    const shippingPrice = await calculateDynamicShipping(
      shippingAddress.thana || shippingAddress.city || "",
      shippingAddress.district || "",
      shippingAddress.division || "",
      dbOrderItems,
      itemsPrice,
    );

    const taxPrice = 0;

    const totalSavings = dbOrderItems.reduce((acc, item) => {
      const qty = Number(item.qty) || 1;
      const savingsPerItem = calculateSavings(
        item,
        item.variantInfo?.variantPrice,
      );
      return acc + savingsPerItem * qty;
    }, 0);

    // ==========================================
    //  COUPON VALIDATION & CALCULATION
    // ==========================================
    let couponDiscount = 0;
    let appliedCuppon = {
      cupponId: null,
      code: null,
      discountType: null,
      discountValue: 0,
      discountAmount: 0,
    };

    if (cupponCode) {
      try {
        const cuppon = await Cuppon.findOne({
          code: cupponCode.toUpperCase().trim(),
          isActive: true,
        });

        if (cuppon) {
          const now = new Date();
          if (now >= cuppon.startDate && now <= cuppon.endDate) {
            const usageOk =
              cuppon.usageLimit === null ||
              cuppon.usageCount < cuppon.usageLimit;
            let perUserOk = true;
            if (cuppon.perUserLimit !== null) {
              const userUsageCount = await Order.countDocuments({
                user: req.user._id,
                "appliedCuppon.cupponId": cuppon._id,
              });
              perUserOk = userUsageCount < cuppon.perUserLimit;
            }
            let firstTimeOk = true;
            if (cuppon.isFirstTimeOnly) {
              const previousOrders = await Order.countDocuments({
                user: req.user._id,
              });
              firstTimeOk = previousOrders === 0;
            }
            const minimumAmountOk = itemsPrice >= cuppon.minimumOrderAmount;

            if (usageOk && perUserOk && firstTimeOk && minimumAmountOk) {
              if (cuppon.discountType === "percentage") {
                couponDiscount = (itemsPrice * cuppon.discountValue) / 100;
                if (
                  cuppon.maximumDiscountAmount !== null &&
                  couponDiscount > cuppon.maximumDiscountAmount
                ) {
                  couponDiscount = cuppon.maximumDiscountAmount;
                }
              } else {
                couponDiscount = cuppon.discountValue;
                if (couponDiscount > itemsPrice) {
                  couponDiscount = itemsPrice;
                }
              }
              appliedCuppon = {
                cupponId: cuppon._id,
                code: cuppon.code,
                discountType: cuppon.discountType,
                discountValue: cuppon.discountValue,
                discountAmount: Number(couponDiscount.toFixed(2)),
              };
              await Cuppon.updateOne(
                { _id: cuppon._id },
                { $inc: { usageCount: 1 } },
              );
            }
          }
        }
      } catch (cupponErr) {
        console.error("Coupon Apply Error:", cupponErr.message);
      }
    }

    // Final Total Price Calculation
    const totalPrice = Number(
      (itemsPrice - couponDiscount + shippingPrice + taxPrice).toFixed(2),
    );

    // Payment Status Logic
    let paymentStatus;
    if (paymentMethod === "Cash on Delivery") {
      paymentStatus = "due";
    } else if (["bKash", "Nagad", "Rocket", "Bank"].includes(paymentMethod)) {
      paymentStatus = "awaiting_verification";
    } else if (paymentMethod === "SSLCommerz") {
      paymentStatus = "pending";
    } else {
      paymentStatus = "pending";
    }

    // Create Order Object
    const order = new Order({
      orderId: generateOrderId(),
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice: Number(itemsPrice.toFixed(2)),
      taxPrice: Number(taxPrice.toFixed(2)),
      shippingPrice: Number(shippingPrice.toFixed(2)),
      totalPrice,
      totalSavings: Number(totalSavings.toFixed(2)),
      appliedCuppon: couponDiscount > 0 ? appliedCuppon : undefined,
      paymentStatus,
      isPaid: false,
    });

    const createdOrder = await order.save();

    // Stock Decrement Logic
    for (const item of dbOrderItems) {
      if (item.variantInfo?.hasVariants) {
        await Product.updateOne(
          {
            _id: item.product,
            "variants.color.name": item.variantInfo.colorName,
          },
          { $inc: { "variants.$[v].sizes.$[s].countInStock": -item.qty } },
          {
            arrayFilters: [
              { "v.color.name": item.variantInfo.colorName },
              { "s.size": item.variantInfo.sizeName },
            ],
          },
        );
      } else {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { countInStock: -item.qty, salesCount: item.qty } },
        );
      }
    }

    // ✅✅ সবচেয়ে গুরুত্বপূর্ণ পরিবর্তন: SSLCommerz এর ক্ষেত্রে নোটিফিকেশন ও ইমেইল ব্লক করা হয়েছে
    const isGatewayPayment = paymentMethod === "SSLCommerz";

    if (!isGatewayPayment) {
      // Notification Logic
      try {
        await createAndSendNotification(req, {
          userId: order.user,
          title: "Order Placed! 🛒",
          message: `Your order #${order.orderId} has been confirmed.${
            couponDiscount > 0 ? ` Coupon ${appliedCuppon.code} applied!` : ""
          }${
            ["bKash", "Nagad", "Rocket", "Bank"].includes(paymentMethod)
              ? " Payment successful. Verification in progress."
              : ""
          }`,
          type: "order",
          actionUrl: `/order/${order._id}`,
          sendEmailFlag: true,
        });
      } catch (err) {
        console.error("Notification Error:", err.message);
      }

      const populatedOrder = await createdOrder.populate(
        "user",
        "username email",
      );

      // Email Sending Logic
      const sendEmails = async () => {
        try {
          let paymentInstructions = "";
          if (["bKash", "Nagad", "Rocket", "Bank"].includes(paymentMethod)) {
            paymentInstructions = `
            <div style="background-color: #fff9db; padding: 15px; border-left: 4px solid #fab005; margin-bottom: 20px;">
              <p style="color: #856404; font-weight: bold; margin: 0;">Payment Received!</p>
              <p style="margin: 5px 0 0 0; font-size: 14px;">
                Your payment via <strong>${paymentMethod}</strong> is currently undergoing verification. 
                We will notify you once it's confirmed.
              </p>
            </div>`;
          }

          const itemsDetails = dbOrderItems
            .map((item) => {
              let variantText = item.variantInfo?.hasVariants
                ? `<br/><small style="color: #666;">Variant: ${item.variantInfo.colorName} / ${item.variantInfo.sizeName}</small>`
                : "";
              let savingsText =
                item.discountPercentage > 0
                  ? `<br/><small style="color: #dc2626;">You saved ৳${((item.price - item.finalPrice) * item.qty).toFixed(2)}</small>`
                  : "";
              return `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                  <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                  <strong>${item.name}</strong> ${variantText} ${savingsText}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}x</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">৳${(item.finalPrice * item.qty).toFixed(2)}</td>
              </tr>`;
            })
            .join("");

          await sendEmail({
            to: populatedOrder.user.email,
            subject: `Order Success - ${populatedOrder.orderId}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hi ${populatedOrder.user.username},</h2>
                <p>Thank you for your order!</p>
                ${paymentInstructions}
                <h3>Order Summary:</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <thead><tr style="background: #f3f4f6;">
                    <th style="padding: 10px; text-align: left;">Image</th>
                    <th style="padding: 10px; text-align: left;">Product</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                  </tr></thead>
                  <tbody>${itemsDetails}</tbody>
                </table>
                <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                  <p style="margin: 5px 0;"><strong>Order ID:</strong> #${populatedOrder.orderId}</p>
                  <p style="margin: 5px 0;"><strong>Subtotal:</strong> ৳${itemsPrice.toFixed(2)}</p>
                  <p style="margin: 5px 0;"><strong>Shipping:</strong> ৳${shippingPrice.toFixed(2)}</p>
                  ${couponDiscount > 0 ? `<p style="margin: 5px 0; color: #16a34a;"><strong>Coupon (${appliedCuppon.code}):</strong> -৳${couponDiscount.toFixed(2)}</p>` : ""}
                  ${Number(totalSavings) > 0 ? `<p style="margin: 5px 0; color: #dc2626;"><strong>Product Savings:</strong> -৳${Number(totalSavings).toFixed(2)}</p>` : ""}
                  <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;"><strong>Total Payable:</strong> ৳${totalPrice}</p>
                </div>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Becha Bikri. All rights reserved.</p>
              </div>`,
          });

          const adminItemsList = dbOrderItems
            .map(
              (item) =>
                `<li>${item.name} ${item.variantInfo?.hasVariants ? `(${item.variantInfo.colorName}/${item.variantInfo.sizeName})` : ""} - ${item.qty}x - ৳${(item.finalPrice * item.qty).toFixed(2)}</li>`,
            )
            .join("");

          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `🔔 New Order #${populatedOrder.orderId}`,
            html: `<div style="font-family: sans-serif; max-width: 600px;">
              <h3 style="color: #2563eb;">New Order Received!</h3>
              <p>A new order has been placed by <strong>${populatedOrder.user.username}</strong> (${populatedOrder.user.email}).</p>
              <h4>Items:</h4><ul>${adminItemsList}</ul>
              <hr />
              <p><strong>Order ID:</strong> ${populatedOrder.orderId}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              ${couponDiscount > 0 ? `<p><strong>Coupon Used:</strong> ${appliedCuppon.code} (-৳${couponDiscount.toFixed(2)})</p>` : ""}
              <p><strong>Total Amount:</strong> ৳${totalPrice}</p>
            </div>`,
          });
        } catch (mailErr) {
          console.error("Email Sending Error:", mailErr.message);
        }
      };

      sendEmails();
    } // ✅ এখানে SSLCommerz এর ব্লক শেষ হচ্ছে

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Create Order Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "id username email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLocalTime = (utcTime) => {
  return new Date(utcTime).toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
};

const findOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { orderId: id };

    const order = await Order.findOne(query).populate("user", "username email");

    if (order) {
      const response = {
        ...order.toObject(),
        paidAt: order.paidAt ? getLocalTime(order.paidAt) : null,
        deliveredAt: order.deliveredAt ? getLocalTime(order.deliveredAt) : null,
      };
      res.json(response);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  } catch (error) {
    console.error("Backend Error in findOrderById:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ==========================================
    //  ১. বেসিক ভ্যালিডেশন
    // ==========================================
    const validStatuses = [
      "paid",
      "due",
      "pending",
      "failed",
      "awaiting_verification",
      "refunded", // ✅ স্কিমা অনুযায়ী রিফান্ড অ্যাড করা হলো
    ];

    // যদি ফ্রন্টএন্ড থেকে কোনো স্টেটাস না পাঠানো হয়, তাহলে ধরে নেওয়া হবে অ্যাডমিন/সিস্টেম এটাকে "paid" করতে চাচ্ছে
    const targetStatus = req.body.status || "paid";

    if (!validStatuses.includes(targetStatus)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    // ==========================================
    //  ২. ✅ সেফ গার্ড (Payment Status Transition Logic)
    // ==========================================
    const currentStatus = order.paymentStatus;

    const allowedPaymentTransitions = {
      pending: ["paid", "failed", "awaiting_verification"],
      awaiting_verification: ["paid", "failed", "pending"], // ভেরিফিকেশন ব্যর্থ হলে pending বা failed করা যাবে
      due: ["paid"], // ক্যাশ অন ডেলিভারি শুধু paid এ যাবে
      paid: ["refunded"], // ✅ paid থেকে শুধু রিফান্ডে যাওয়া যাবে, আর কোথাও নয়
      failed: ["pending", "due"], // ফেইল হলে রিট্রাই করতে পারে বা COD এ কনভার্ট করতে পারে
      refunded: [], // ✅ একবার রিফান্ড হলে আর কোনো অবস্থায় যাওয়া যাবে না
    };

    // চেক করা হচ্ছে বর্তমান স্টেটাস থেকে টার্গেট স্টেটাসে যাওয়ার অনুমতি আছে কি না
    if (!allowedPaymentTransitions[currentStatus]?.includes(targetStatus)) {
      return res.status(400).json({
        error: `Invalid payment transition! Cannot change from '${currentStatus}' to '${targetStatus}'.`,
      });
    }

    // ==========================================
    //  ৩. পেমেন্ট ডেটা আপডেট (কোড ডুপ্লিকেশন রিমুভ করা হয়েছে)
    // ==========================================
    order.paymentStatus = targetStatus;
    order.isPaid = targetStatus === "paid";

    if (targetStatus === "paid") {
      const paidAtTime = req.body.paidAt
        ? new Date(req.body.paidAt)
        : new Date();
      order.paidAt = paidAtTime;

      // SSLCommerz বা অন্য গেটওয়ে হলে paymentResult সেভ করা
      if (order.paymentMethod !== "Cash on Delivery") {
        order.paymentResult = {
          id: req.body.id || "N/A",
          status: req.body.gateway_status || "Completed", // ✅ নাম পরিবর্তন করা হয়েছে কনফ্লিক্ট এড়ানোর জন্য
          update_time: req.body.update_time || paidAtTime.toISOString(),
          email_address: req.body.payer?.email_address || "N/A",
          val_id: req.body.val_id || undefined,
          bank_tran_id: req.body.bank_tran_id || undefined,
          card_type: req.body.card_type || undefined,
          card_no: req.body.card_no || undefined,
          currency_type: req.body.currency_type || undefined,
          gateway_type:
            req.body.gateway_type ||
            (order.paymentMethod === "SSLCommerz" ? "SSLCommerz" : undefined),
        };
      }
    } else {
      // paid না হলে paidAt এবং paymentResult ক্লিয়ার করে দেওয়া হলো
      order.paidAt = null;
      order.paymentResult = undefined;
    }

    const updatedOrder = await order.save();

    // ==========================================
    //  ৪. NOTIFICATION & EMAIL LOGIC
    // ==========================================
    let notificationConfig = {
      userId: updatedOrder.user,
      type: "order",
      actionUrl: `/order/${updatedOrder.orderId}`,
      sendEmailFlag: false,
    };

    if (updatedOrder.paymentStatus === "paid") {
      notificationConfig.title = "Payment Received ✅";
      notificationConfig.message = `Payment for order #${updatedOrder.orderId} is successful.`;

      try {
        const populatedPaidOrder = await Order.findById(
          updatedOrder._id,
        ).populate("user", "username email");

        if (populatedPaidOrder && populatedPaidOrder.user.email) {
          await sendEmail({
            to: populatedPaidOrder.user.email,
            subject: `Payment Confirmed - Order #${populatedPaidOrder.orderId}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #16a34a;">Payment Confirmed! ✅</h2>
                <p>Hi <strong>${populatedPaidOrder.user.username}</strong>,</p>
                <p>Great news! Your payment for order <strong>#${populatedPaidOrder.orderId}</strong> has been successfully verified and confirmed.</p>
                <p>We are now processing your order and will notify you once it ships.</p>
                
                <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                  <p style="margin: 0 0 5px 0;"><strong>Order ID:</strong> ${populatedPaidOrder.orderId}</p>
                  <p style="margin: 0 0 5px 0;"><strong>Amount Paid:</strong> ৳${populatedPaidOrder.totalPrice.toFixed(2)}</p>
                  <p style="margin: 0;"><strong>Payment Method:</strong> ${populatedPaidOrder.paymentMethod}</p>
                </div>
                
                <p style="font-size: 14px; color: #6b7280;">Thank you for shopping with Becha Bikri!</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2024 Becha Bikri. All rights reserved.</p>
              </div>`,
          });
        }
      } catch (mailErr) {
        console.error("Payment Success Email Error:", mailErr.message);
      }
    } else if (updatedOrder.paymentStatus === "due") {
      notificationConfig.title = "Payment Due ⏳";
      notificationConfig.message = `Payment is due for order #${updatedOrder.orderId}. Please complete it soon.`;
    } else if (updatedOrder.paymentStatus === "pending") {
      notificationConfig.title = "Payment Pending ⌛";
      notificationConfig.message = `Your payment for order #${updatedOrder.orderId} is currently pending.`;
    } else if (updatedOrder.paymentStatus === "failed") {
      notificationConfig.title = "Payment Failed ❌";
      notificationConfig.message = `Unfortunately, the payment for order #${updatedOrder.orderId} has failed.`;
    } else if (updatedOrder.paymentStatus === "refunded") {
      // ✅ নতুন যোগ করা হয়েছে
      notificationConfig.title = "Payment Refunded 💸";
      notificationConfig.message = `Your payment for order #${updatedOrder.orderId} has been refunded. It may take 3-5 business days to appear in your account.`;
    }

    if (notificationConfig.title) {
      await createAndSendNotification(req, notificationConfig);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Mark Order Paid Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const { status, courierName, courierTrackingId } = req.body;

    const validStatuses = [
      "Order Placed",
      "Confirmed",
      "Processing",
      "Packed",
      "Picked Up by Courier",
      "In Transit",
      "At Local Hub",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const allowedTransitions = {
      "Order Placed": ["Confirmed", "Processing", "Cancelled"],
      Confirmed: ["Processing", "Cancelled"],
      Processing: ["Packed", "Cancelled"],
      Packed: ["Picked Up by Courier", "Cancelled"],
      "Picked Up by Courier": ["In Transit", "At Local Hub", "Returned"],
      "In Transit": ["At Local Hub", "Out for Delivery", "Returned"],
      "At Local Hub": ["Out for Delivery", "Returned"],
      "Out for Delivery": ["Delivered", "At Local Hub", "Returned"],
      Delivered: ["Returned"],
      Cancelled: [],
      Returned: [],
    };

    const currentStatus = order.isDelivered;

    // চেক করা হচ্ছে বর্তমান স্টেটাস থেকে নতুন স্টেটাসে যাওয়ার অনুমতি আছে কি না
    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        error: `Invalid transition! You cannot change order status from '${currentStatus}' to '${status}'.`,
      });
    }

    if (
      [
        "Picked Up by Courier",
        "In Transit",
        "At Local Hub",
        "Out for Delivery",
      ].includes(status)
    ) {
      // যদি আগে থেকে কোনো ট্র্যাকিং নম্বর না থাকে, তাহলেই নতুন করে চাইবে
      if (!order.courierTrackingId && !courierTrackingId) {
        return res.status(400).json({
          error:
            "Courier tracking ID is required when marking an order as shipped.",
        });
      }
      // নতুন ভ্যালু পেলে আপডেট করবে, না পেলে আগেরটাই রাখবে
      if (courierTrackingId) order.courierTrackingId = courierTrackingId;
      if (courierName) order.courierName = courierName;
    }

    // ==========================================
    //  ৪. অর্ডার আপডেট
    // ==========================================
    order.isDelivered = status;

    if (status === "Delivered") {
      order.deliveredAt = new Date();
    }

    // ক্যান্সেল বা রিটার্ন হলে ডেলিভারি ডেট রিমুভ করা (যদি ভুলবশত ডেলিভার্ড থেকে রিটার্ন নেওয়া হয়)
    if (["Cancelled", "Returned"].includes(status)) {
      order.deliveredAt = null;
    }

    const updatedOrder = await order.save();

    // ==========================================
    //  ৫. অটোমেটিক ট্র্যাকিং লগে পুশ করা
    // ==========================================
    // ==========================================
    //  ✅ অটোমেটিক ট্র্যাকিং লগে পুশ করা (Courier API রেডি)
    // ==========================================
    let trackingMessage = `Order status updated to ${status}.`;
    let eventObj = {
      status: status,
      message: trackingMessage,
    };

    if (["Shipped", "Picked Up by Courier"].includes(status)) {
      trackingMessage = `Package handed over to ${courierName || "Courier"}. Tracking ID: ${courierTrackingId}`;
      eventObj = {
        status: status,
        message: trackingMessage,
        location: "Seller Warehouse",
        courierName: courierName || "",
        trackingId: courierTrackingId || "",
      };
    }

    await OrderTracking.findOneAndUpdate(
      { orderId: updatedOrder.orderId },
      {
        // ✅ নতুন ডকুমেন্ট তৈরি হলে শুধুমাত্র এই দুটো ফিল্ড সেট হবে
        $setOnInsert: {
          order: updatedOrder._id,
          orderId: updatedOrder.orderId,
        },
        $push: {
          events: eventObj,
        },
      },
      { new: true, upsert: true },
    );

    // ==========================================
    //  ৬. নোটিফিকেশন ও ইমেইল লজিক
    // ==========================================
    let notificationMessage = `Your order #${updatedOrder.orderId} has been updated to ${status}.`;

    if (["Picked Up by Courier"].includes(status) && courierTrackingId) {
      notificationMessage = `Your order #${updatedOrder.orderId} has been shipped via ${courierName}. Tracking ID: ${courierTrackingId}`;
    }

    // ক্যান্সেল বা রিটার্নের জন্য আলাদা মেসেজ (ঐচ্ছিক, আপনার প্রয়োজনমতো পরিবর্তন করতে পারেন)
    if (status === "Cancelled") {
      notificationMessage = `Your order #${updatedOrder.orderId} has been cancelled.`;
    } else if (status === "Returned") {
      notificationMessage = `Your order #${updatedOrder.orderId} return process has been initiated.`;
    }

    await createAndSendNotification(req, {
      userId: updatedOrder.user,
      title: `Order Update: ${status}`,
      message: notificationMessage,
      type: "order",
      actionUrl: `/order/${updatedOrder.orderId}`,
      sendEmailFlag: true,
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Update Order Status Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export {
  createOrder,
  getAllOrders,
  getUserOrders,
  findOrderById,
  markOrderAsPaid,
  updateOrderStatus,
};
