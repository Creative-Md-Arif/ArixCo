import PaymentMethod from "../models/paymentMethodModel.js";
import Order from "../models/orderModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import sendEmail from "../utils/sendEmail.js";
import axios from "axios";
// @desc    Get all active payment methods
// @route   GET /api/payments/methods
// @access  Public
const getPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await PaymentMethod.find({ isActive: true }).select("-__v");
  res.json(methods);
});

// @desc    Create or Update payment method
// @route   POST /api/payments/methods
// @access  Admin
const createOrUpdatePaymentMethod = asyncHandler(async (req, res) => {
  const { type, number, accountType, accountName, instructions, icon } =
    req.body;

  if (!type || !number || !accountName) {
    res.status(400);
    throw new Error("Please provide type, number and account name");
  }

  const paymentMethod = await PaymentMethod.findOneAndUpdate(
    { type },
    {
      type,
      number,
      accountType: accountType || "Personal",
      accountName,
      instructions: instructions || "",
      icon: icon || "",
      isActive: true,
    },
    { upsert: true, new: true, runValidators: true },
  );

  res.status(201).json(paymentMethod);
});



const checkTransactionId = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  if (!transactionId || transactionId.length < 8) {
    return res.status(400).json({
      exists: false,
      error: "Invalid transaction ID",
    });
  }

  try {
    const existingOrder = await Order.findOne({
      "manualPaymentDetails.transactionId": transactionId.toUpperCase(),
    });

    res.json({
      exists: !!existingOrder,
      orderId: existingOrder ? existingOrder.orderId : null,
    });
  } catch (error) {
    console.error("Check transaction error:", error);
    res.status(500).json({
      exists: false,
      error: "Server error while checking transaction",
    });
  }
});


const deletePaymentMethod = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findOne({ type: req.params.type });

  if (!method) {
    res.status(404);
    throw new Error("Payment method not found");
  }

  method.isActive = false;
  await method.save();

  res.json({ message: "Payment method deactivated" });
});

// @desc    Submit manual payment
// @route   PUT /api/payments/submit/:orderId
// @access  Private
const submitManualPayment = asyncHandler(async (req, res) => {
  const {
    transactionId,
    senderNumber,
    selectedPaymentMethod,
    sentAmount,
    paymentScreenshot,
  } = req.body;
  const { orderId } = req.params;

  if (!transactionId || !senderNumber || !selectedPaymentMethod) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Check duplicate Transaction ID
  const existingOrder = await Order.findOne({
    "manualPaymentDetails.transactionId": transactionId.toUpperCase(),
    _id: { $ne: orderId },
  });

  if (existingOrder) {
    res.status(400);
    throw new Error("This Transaction ID has already been used");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error("Not authorized");
  }

  order.manualPaymentDetails = {
    transactionId: transactionId.toUpperCase(),
    senderNumber,
    selectedPaymentMethod,
    sentAmount: Number(sentAmount) || order.totalPrice,
    paymentScreenshot: paymentScreenshot || "",
  };

  order.paymentStatus = "awaiting_verification";

  await order.save();

  // Notify Admin
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Payment Verification Required",
      html: `
        <h2>New Manual Payment Submitted</h2>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Amount:</strong> ৳${order.totalPrice}</p>
        <p><strong>Method:</strong> ${selectedPaymentMethod}</p>
        <p><strong>Transaction ID:</strong> ${transactionId.toUpperCase()}</p>
        <p><strong>From:</strong> ${senderNumber}</p>
        <a href="${process.env.FRONTEND_URL}/admin/orderlist" style="padding: 10px 20px; background: #000; color: #fff; text-decoration: none;">Verify Now</a>
      `,
    });
  } catch (error) {
    console.error("Admin email failed:", error);
  }

  res.json({
    message: "Payment details submitted successfully",
    order,
  });
});

// @desc    Verify manual payment
// @route   PUT /api/payments/verify/:orderId
// @access  Admin
const verifyManualPayment = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const { orderId } = req.params;

  if (!["paid", "failed"].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'paid' or 'failed'");
  }

  const order = await Order.findById(orderId).populate(
    "user",
    "username email",
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (status === "paid") {
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentStatus = "paid";
    order.paymentVerifiedBy = req.user._id;
    order.paymentVerifiedAt = new Date();
    order.paymentVerificationNotes = notes || "";
    order.isDelivered = "Processing";
  } else {
    order.paymentStatus = "failed";
    order.paymentVerificationNotes = notes || "Verification failed";
  }

  await order.save();

  // Send email to customer
  const emailSubject =
    status === "paid"
      ? "Payment Verified - Order Confirmed"
      : "Payment Verification Failed";
  const emailHtml =
    status === "paid"
      ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Payment Verified!</h2>
        <p>Dear ${order.user.username},</p>
        <p>Your payment for order <strong>#${order.orderId}</strong> has been verified.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> ৳${order.totalPrice}</p>
          <p><strong>Transaction ID:</strong> ${order.manualPaymentDetails?.transactionId}</p>
        </div>
        <p>Your order is now being processed.</p>
      </div>
    `
      : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Payment Failed</h2>
        <p>Dear ${order.user.username},</p>
        <p>We couldn't verify your payment for order <strong>#${order.orderId}</strong>.</p>
        <p><strong>Reason:</strong> ${notes || "Invalid transaction"}</p>
      </div>
    `;

  try {
    await sendEmail({
      to: order.user.email,
      subject: emailSubject,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Customer email failed:", error);
  }

  res.json({
    message: `Payment ${status === "paid" ? "verified" : "rejected"}`,
    order,
  });
});

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Admin
const getPaymentStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $match: {
        paymentMethod: { $in: ["bKash", "Nagad", "Rocket", "Bank"] },
      },
    },
    {
      $group: {
        _id: "$paymentMethod",
        totalAmount: { $sum: "$totalPrice" },
        count: { $sum: 1 },
        pending: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "awaiting_verification"] }, 1, 0],
          },
        },
        verified: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
        },
        failed: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "failed"] }, 1, 0] },
        },
      },
    },
  ]);

  const overall = await Order.aggregate([
    {
      $match: {
        paymentMethod: { $in: ["bKash", "Nagad", "Rocket", "Bank"] },
        paymentStatus: "paid",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
        totalTransactions: { $sum: 1 },
      },
    },
  ]);

  res.json({
    byMethod: stats,
    overall: overall[0] || { totalRevenue: 0, totalTransactions: 0 },
  });
});


const initSSLCommerz = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId).populate("user", "email");
  
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  // SSLCommerz এর জন্য ডেটা প্রস্তুত করা
  const data = {
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
    total_amount: order.totalPrice.toString(),
    currency: "BDT",
    tran_id: order._id.toString(),
    success_url: `${process.env.BACKEND_URL}/api/payments/sslcommerz/success`,
    fail_url: `${process.env.BACKEND_URL}/api/payments/sslcommerz/fail`,
    cancel_url: `${process.env.BACKEND_URL}/api/payments/sslcommerz/cancel`,
    ipn_url: `${process.env.BACKEND_URL}/api/payments/sslcommerz/ipn`,

    // Customer Info
    cus_name: order.shippingAddress.name || "Customer",
    cus_email: order.user.email || "default@email.com",
    cus_add1: order.shippingAddress.address || "N/A",
    cus_city:
      order.shippingAddress.city || order.shippingAddress.thana || "Dhaka",
    cus_postcode: order.shippingAddress.postalCode || "1200",
    cus_country: order.shippingAddress.country || "Bangladesh",
    cus_phone: order.shippingAddress.phoneNumber || "01700000000",

    // ✅✅ SSLCommerz Mandatory Shipping Info (কাস্টমার ইনফোর মতো একই দিয়ে দিচ্ছি)
    ship_name: order.shippingAddress.name || "Customer",
    ship_add1: order.shippingAddress.address || "N/A",
    ship_add2: order.shippingAddress.thana || "N/A",
    ship_city:
      order.shippingAddress.city || order.shippingAddress.thana || "Dhaka",
    ship_state: order.shippingAddress.district || "Dhaka",
    ship_postcode: order.shippingAddress.postalCode || "1200",
    ship_country: order.shippingAddress.country || "Bangladesh",
    ship_phone: order.shippingAddress.phoneNumber || "01700000000",

    // Product Info
    product_name: "E-commerce Order",
    product_category: "General",
    product_profile: "general",
    shipping_method: "Courier",
    num_of_item: order.orderItems.length.toString(),
  };

  try {
    const params = new URLSearchParams();
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        params.append(key, data[key]);
      }
    }

    const response = await axios.post(process.env.SSLCOMMERZ_API_URL, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (response.data.status === "SUCCESS") {
      res.json({ url: response.data.GatewayPageURL });
    } else {
      console.error("SSLCommerz Failed Reason:", response.data.failedreason || response.data.error);
      res.status(400).json({ 
        error: "SSLCommerz session creation failed", 
        details: response.data.failedreason || "Invalid data sent to SSLCommerz"
      });
    }
  } catch (error) {
    console.error("SSLCommerz Init Network Error:", error.message);
    res.status(500).json({ error: "Payment initialization failed", details: error.message });
  }
});

const handleSSLCommerzIPN = asyncHandler(async (req, res) => {
  try {
    const { val_id, tran_id, status, amount, bank_tran_id, card_type, card_no, currency_type } = req.body;

    if (status === "VALID") {
      const validationRes = await axios.get(process.env.SSLCOMMERZ_VALIDATION_URL, {
        params: {
          val_id: val_id,
          store_id: process.env.SSLCOMMERZ_STORE_ID,
          store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
          format: "json",
        },
      });

      if (validationRes.data.status === "VALID_TRANSACTION") {
        // ✅ User এর ইনফো পাওয়ার জন্য populate করা হচ্ছে
        const order = await Order.findById(tran_id).populate("user", "username email");
        
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentStatus = "paid";
          order.isDelivered = "Processing"; 

          order.paymentResult = {
            id: val_id,
            status: validationRes.data.status,
            update_time: new Date().toISOString(),
            email_address: order.user.email || "N/A",
            val_id: val_id,
            bank_tran_id: bank_tran_id || validationRes.data.bank_tran_id,
            card_type: card_type || validationRes.data.card_type,
            card_no: card_no || validationRes.data.card_no,
            currency_type: currency_type || validationRes.data.currency_type,
            gateway_type: "SSLCommerz",
          };

          await order.save();
          console.log(`Order ${tran_id} paid via SSLCommerz`);

          // ✅✅ পেমেন্ট সফল হওয়ার পর নোটিফিকেশন এবং ইমেইল পাঠানো হচ্ছে
          try {
            // 1. ইউজারকে সাকসেস ইমেইল
            await sendEmail({
              to: order.user.email,
              subject: `Payment Confirmed - Order #${order.orderId}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                  <h2 style="color: #16a34a;">Payment Confirmed! ✅</h2>
                  <p>Hi <strong>${order.user.username}</strong>,</p>
                  <p>Your payment for order <strong>#${order.orderId}</strong> via SSLCommerz has been successfully verified and confirmed.</p>
                  <p>We are now processing your order and will notify you once it ships.</p>
                  
                  <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                    <p style="margin: 0 0 5px 0;"><strong>Order ID:</strong> ${order.orderId}</p>
                    <p style="margin: 0 0 5px 0;"><strong>Amount Paid:</strong> ৳${order.totalPrice.toFixed(2)}</p>
                    <p style="margin: 0;"><strong>Payment Method:</strong> SSLCommerz (${card_type || "Online Gateway"})</p>
                  </div>
                  
                  <p style="font-size: 14px; color: #6b7280;">Thank you for shopping with us!</p>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
                  <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2024 Becha Bikri. All rights reserved.</p>
                </div>`,
            });

            // 2. এডমিনকে সাকসেস ইমেইল
            await sendEmail({
              to: process.env.ADMIN_EMAIL,
              subject: `💳 SSLCommerz Payment Verified - #${order.orderId}`,
              html: `<div style="font-family: sans-serif; max-width: 600px;">
                <h3 style="color: #16a34a;">Payment Verified via SSLCommerz!</h3>
                <p>Payment for order <strong>#${order.orderId}</strong> by <strong>${order.user.username}</strong> has been verified.</p>
                <p><strong>Amount:</strong> ৳${order.totalPrice.toFixed(2)}</p>
                <p><strong>Bank Tran ID:</strong> ${bank_tran_id || "N/A"}</p>
              </div>`,
            });

            // 3. ইউজারকে ডাটাবেস নোটিফিকেশন
            // (যদি আপনার createAndSendNotification ফাংশন req ছাড়া কাজ করে, তবে এটি ব্যবহার করুন, নাহলে শুধু ইমেইলই যথেষ্ট)
            try {
               const mockReq = { user: { _id: null } }; // Admin action, no req.user needed
               await createAndSendNotification(mockReq, {
                 userId: order.user._id,
                 title: "Payment Received ✅",
                 message: `Your payment for order #${order.orderId} via SSLCommerz is successful.`,
                 type: "order",
                 actionUrl: `/order/${order._id}`,
                 sendEmailFlag: false, // ইমেইল আগেই পাঠানো হয়েছে
               });
            } catch(notifErr) {
               console.error("IPN Notification Error:", notifErr.message);
            }

          } catch (mailErr) {
            console.error("IPN Email Error:", mailErr.message);
          }
        }
      }
    }
    res.status(200).send("IPN Received");
  } catch (error) {
    console.error("IPN Error:", error.message);
    res.status(500).json({ error: "IPN processing failed" });
  }
});


const validateSSLCommerzPayment = asyncHandler(async (req, res) => {
  const { val_id } = req.body;

  try {
    const validationRes = await axios.get(
      process.env.SSLCOMMERZ_VALIDATION_URL,
      {
        params: {
          val_id: val_id,
          store_id: process.env.SSLCOMMERZ_STORE_ID,
          store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
          format: "json",
        },
      },
    );

    if (validationRes.data.status === "VALID_TRANSACTION") {
      res.json({
        success: true,
        message: "Payment verified",
        data: validationRes.data,
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid transaction" });
    }
  } catch (error) {
    res.status(500).json({ error: "Validation failed" });
  }
});


const sslcommerzSuccessRedirect = asyncHandler(async (req, res) => {
  const tran_id = req.body.tran_id; 
  res.redirect(
    303,
    `${process.env.FRONTEND_URL}/payment/success?tran_id=${tran_id}`,
  );
});


const sslcommerzFailRedirect = asyncHandler(async (req, res) => {
  const tran_id = req.body.tran_id;
  res.redirect(
    303,
    `${process.env.FRONTEND_URL}/payment/fail?tran_id=${tran_id}`,
  );
});


const sslcommerzCancelRedirect = asyncHandler(async (req, res) => {
  const tran_id = req.body.tran_id;
  res.redirect(
    303,
    `${process.env.FRONTEND_URL}/payment/cancel?tran_id=${tran_id}`,
  );
});


export {
  getPaymentMethods,
  createOrUpdatePaymentMethod,
  deletePaymentMethod,
  submitManualPayment,
  verifyManualPayment,
  getPaymentStats,
  checkTransactionId,
  initSSLCommerz,
  handleSSLCommerzIPN,
  validateSSLCommerzPayment,
  sslcommerzSuccessRedirect,
  sslcommerzFailRedirect, 
  sslcommerzCancelRedirect,
};
