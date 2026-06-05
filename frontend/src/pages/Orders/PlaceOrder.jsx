/* eslint-disable react/prop-types */
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useCreateOrderMutation } from "@redux/api/orderApiSlice";
import { useValidateCupponMutation } from "@redux/api/cupponApiSlice";
import { clearCartItems, addToCart } from "../../redux/features/cart/cartSlice";
import { useState } from "react";
import { toast } from "react-toastify";
import { FaMinus, FaPlus, FaXmark, FaSpinner } from "react-icons/fa6";

/* ─── helpers ─────────────────────────────────────────────── */
const getItemFinalPrice = (item) =>
  Number(item._finalPrice) ||
  Number(item._effectivePrice) ||
  Number(item.finalPrice) ||
  Number(item.price) ||
  0;

const getItemBasePrice = (item) =>
  Number(item.basePrice) ||
  Number(item.variantInfo?.variantPrice) ||
  Number(item.price) ||
  0;

/* ─── Inline cart items ────────────────────────────────────── */
const InlineItems = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const addToCartHandler = (product, qty) =>
    dispatch(addToCart({ ...product, qty }));

  return (
    <div>
      <div className="flex items-center justify-between pb-3 border-b border-black mb-4">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-black">
          Your Items
        </span>
        <Link
          to="/cart"
          className="text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-black"
        >
          Edit
        </Link>
      </div>
      <div
        className="space-y-0 max-h-[320px] overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {cartItems.map((item, idx) => {
          const displayImage =
            Array.isArray(item?.images) && item.images.length > 0
              ? item.images[0]
              : item?.image || "/placeholder.jpg";
          const unitPrice = getItemFinalPrice(item);
          const basePrice = getItemBasePrice(item);
          const savingsPerUnit = basePrice - unitPrice;
          const totalSavings = savingsPerUnit * item.qty;
          const discountPercent = item.discountPercentage || 0;
          const variantText = item.variantInfo?.hasVariants
            ? `${item.variantInfo.colorName} · ${item.variantInfo.sizeName}`
            : null;

          return (
            <div
              key={`${item._id}-${item.variantInfo?.colorIndex}-${item.variantInfo?.sizeIndex}`}
              className={`flex items-start gap-3 py-4 ${idx !== cartItems.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <div className="w-12 h-12 flex-shrink-0 bg-gray-50 border border-gray-200 overflow-hidden">
                <img
                  src={displayImage}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-bold text-black uppercase tracking-tight line-clamp-1">
                  {item.name}
                </p>
                {variantText && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {item.variantInfo?.colorHex && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-gray-200"
                        style={{ backgroundColor: item.variantInfo.colorHex }}
                      />
                    )}
                    <span className="text-xs font-mono text-gray-500 uppercase">
                      {variantText}
                    </span>
                  </div>
                )}
                {discountPercent > 0 && (
                  <span className="inline-block mt-1 text-[10px] font-mono font-bold px-1.5 py-0.5 bg-black text-white uppercase tracking-wide">
                    −{Math.round(discountPercent)}%
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-right leading-none">
                  <p className="text-sm font-mono font-black text-black">
                    ৳{(item.qty * unitPrice).toLocaleString("en-BD")}
                  </p>
                  {savingsPerUnit > 0 && (
                    <>
                      <p className="text-[10px] font-mono text-gray-400 line-through mt-0.5">
                        ৳{(basePrice * item.qty).toLocaleString("en-BD")}
                      </p>
                      <p className="text-[10px] font-mono text-green-600 font-bold">
                        −৳{Math.round(totalSavings)}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex items-center border border-gray-300 h-6">
                  <button
                    className="w-6 h-6 flex items-center justify-center text-gray-500 border-r border-gray-300 disabled:opacity-30"
                    onClick={() =>
                      item.qty > 1 && addToCartHandler(item, item.qty - 1)
                    }
                    disabled={item.qty === 1}
                  >
                    <FaMinus size={7} />
                  </button>
                  <span className="w-7 text-center text-xs font-mono font-black text-black">
                    {item.qty}
                  </span>
                  <button
                    className="w-6 h-6 flex items-center justify-center text-gray-500 border-l border-gray-300"
                    onClick={() => addToCartHandler(item, item.qty + 1)}
                  >
                    <FaPlus size={7} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {cartItems.length === 0 && (
          <div className="py-10 text-center border border-dashed border-gray-200">
            <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
              Cart is empty
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── PlaceOrder ────────────────────────────────────────────── */
// ✅ Added isShippingCalculating prop from Shipping.jsx
const PlaceOrder = ({
  orderSummary,
  onPlaceOrder,
  onProceedToPayment,
  isShippingCalculating = false,
}) => {
  const {
    cartItems,
    paymentMethod: reduxPaymentMethod,
    shippingAddress,
  } = useSelector((state) => state.cart);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [createOrder] = useCreateOrderMutation();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validateCuppon, { isLoading: isValidating }] =
    useValidateCupponMutation();

  const {
    subtotal,
    shippingCharge,
    totalPrice,
    totalSavings,
    shippingMethodName,
    estimatedDays,
    isFreeShipping,
  } = orderSummary;

  const effectivePaymentMethod =
    reduxPaymentMethod || shippingAddress?.paymentMethod || "Cash on Delivery";
  const isManualPayment = ["bKash", "Nagad", "Rocket", "Bank"].includes(
    effectivePaymentMethod,
  );

  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotalPrice = Math.max(0, totalPrice - couponDiscount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    try {
      const productIds = cartItems.map((item) => item._id || item.product);
      const res = await validateCuppon({
        code: couponInput,
        itemsPrice: subtotal,
        productIds,
      }).unwrap();
      setAppliedCoupon({
        code: res.cuppon.code,
        discountAmount: res.discountAmount,
      });
      setCouponInput("");
      toast.success(`Coupon ${res.cuppon.code} applied!`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err?.data?.error || "Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    setCouponInput("");
  };

  const placeOrderHandler = async () => {
    // ✅ Prevent placing order while shipping is being calculated
    if (isShippingCalculating) {
      toast.info("Please wait while shipping cost is being calculated...");
      return;
    }

    const freshAddress = onPlaceOrder();
    if (!freshAddress) return;

    try {
      setIsLoading(true);

      const orderItemsWithVariants = cartItems.map((item) => ({
        name: item.name,
        qty: Number(item.qty),
        image: item.image || (item.images && item.images[0]),
        price: getItemFinalPrice(item),
        product: item._id || item.product,
        discountPercentage: Number(item.discountPercentage || 0),
        variantInfo: item.variantInfo || {
          hasVariants: false,
          colorIndex: null,
          colorName: "",
          colorHex: "",
          sizeIndex: null,
          sizeName: "",
          variantPrice: null,
          sku: "",
        },
      }));

      // ✅ FIXED: division, district, thana all correctly mapped from freshAddress
      const safeShippingAddress = {
        name: freshAddress.name || "",
        address: freshAddress.address || "",
        city: freshAddress.thana || freshAddress.city || "",
        division: freshAddress.division || "",
        district: freshAddress.district || "",
        thana: freshAddress.thana || "",
        postalCode: freshAddress.postalCode || "0000",
        country: freshAddress.country || "Bangladesh",
        phoneNumber: freshAddress.phoneNumber || "",
      };

      if (
        !safeShippingAddress.postalCode ||
        safeShippingAddress.postalCode === "0000"
      ) {
        toast.error("Please enter a valid postal code!");
        return;
      }
      if (!safeShippingAddress.country) {
        toast.error("Please enter your country!");
        return;
      }

      if (
        !safeShippingAddress.division ||
        !safeShippingAddress.district ||
        !safeShippingAddress.thana
      ) {
        toast.error("Please select your Division, District and Thana!");
        return;
      }

      const resolvedPaymentMethod =
        freshAddress.paymentMethod || effectivePaymentMethod;

      const baseOrderData = {
        orderItems: orderItemsWithVariants,
        shippingAddress: safeShippingAddress,
        paymentMethod: resolvedPaymentMethod,
        itemsPrice: subtotal.toFixed(2),
        shippingPrice: shippingCharge.toFixed(2),
        totalPrice: finalTotalPrice.toFixed(2),
        totalSavings: totalSavings.toFixed(2),
        cupponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const manualPayment = ["bKash", "Nagad", "Rocket", "Bank"].includes(
        resolvedPaymentMethod,
      );

      if (manualPayment) {
        localStorage.setItem("pendingOrderData", JSON.stringify(baseOrderData));
        if (onProceedToPayment) {
          onProceedToPayment(baseOrderData);
        } else {
          navigate("/payment/checkout");
        }
      } else {
        const res = await createOrder(baseOrderData).unwrap();
        toast.success("Order placed successfully! 📦");
        dispatch(clearCartItems());
        localStorage.removeItem("shippingAddress");
        localStorage.removeItem("pendingOrderData");
        navigate(`/order/${res._id}`);
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Something went wrong while placing order.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled =
    isLoading || cartItems.length === 0 || isShippingCalculating;

  return (
    <div className="bg-white border border-gray-200">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 mb-1">
          Review &amp; Confirm
        </p>
        <h2 className="text-2xl font-mono font-black text-black uppercase tracking-tight leading-none">
          Order Summary
        </h2>
      </div>
      <div className="px-6 pt-5 pb-4">
        <InlineItems />
      </div>

      <div className="px-6 pb-4">
        <div className="border border-dashed border-gray-300 p-4 bg-gray-50/50">
          {!appliedCoupon ? (
            <>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-gray-600 mb-2">
                Have a coupon?
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="flex-1 bg-white border border-gray-300 px-3 py-2.5 text-sm font-mono uppercase tracking-widest text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={isValidating || !couponInput.trim()}
                  className="bg-black text-white px-4 text-xs font-mono font-bold uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isValidating ? "..." : "Apply"}
                </button>
              </div>
              {couponError && (
                <p className="text-[10px] font-mono text-red-500 mt-1.5 uppercase tracking-wider">
                  ✕ {couponError}
                </p>
              )}
            </>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-green-700">
                  Coupon Applied ✓
                </p>
                <p className="text-sm font-mono font-black text-green-900 mt-0.5">
                  {appliedCoupon.code}
                </p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Remove coupon"
              >
                <FaXmark size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="mx-6 border-t border-gray-100 pt-4 pb-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-600">
            Subtotal
          </span>
          <span className="text-base font-mono font-black text-black">
            ৳{subtotal.toFixed(2)}
          </span>
        </div>

        {/* ✅ UPDATED: Auto-selected Dynamic Shipping Method Display */}
        <div className="flex justify-between items-start">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-600">
            Shipping
          </span>
          {isShippingCalculating ? (
            <span className="flex items-center gap-1.5 text-xs font-mono text-gray-500">
              <FaSpinner className="animate-spin" size={10} />
              Calculating...
            </span>
          ) : shippingCharge > 0 || isFreeShipping ? (
            <div className="text-right">
              <span className="text-base font-mono font-black text-black">
                {isFreeShipping ? "FREE" : `৳${shippingCharge.toFixed(2)}`}
              </span>
              {shippingMethodName && (
                <p className="text-[10px] text-gray-500 font-mono mt-0.5 leading-tight">
                  {shippingMethodName} {estimatedDays && `· ${estimatedDays}`}
                </p>
              )}
            </div>
          ) : (
            <span className="text-xs font-mono text-gray-500 uppercase">
              Select address
            </span>
          )}
        </div>

        {appliedCoupon && (
          <div className="flex justify-between items-center py-2 px-3 bg-green-50 border border-green-100">
            <span className="text-xs font-mono uppercase tracking-wider text-green-700">
              Coupon ({appliedCoupon.code})
            </span>
            <span className="text-base font-mono font-black text-green-600">
              −৳{appliedCoupon.discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        {totalSavings > 0 && (
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 border border-gray-100">
            <span className="text-xs font-mono uppercase tracking-wider text-green-700">
              Product Savings
            </span>
            <span className="text-base font-mono font-black text-green-600">
              −৳{totalSavings.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="mx-6 border-t-2 border-black pt-4 pb-5 flex justify-between items-baseline">
        <span className="text-sm font-mono font-bold uppercase tracking-wider text-black">
          Total Payable
        </span>
        {isShippingCalculating ? (
          <span className="flex items-center gap-2 text-gray-500 font-mono font-black text-xl">
            <FaSpinner className="animate-spin" size={14} />
            Updating...
          </span>
        ) : (
          <span className="text-3xl font-mono font-black text-black leading-none">
            ৳{finalTotalPrice.toFixed(2)}
          </span>
        )}
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={placeOrderHandler}
          disabled={isButtonDisabled}
          className={`w-full py-4 font-mono font-black text-sm uppercase tracking-widest transition-none ${
            isButtonDisabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isLoading
            ? "Processing..."
            : isShippingCalculating
              ? "Calculating Shipping..."
              : isManualPayment
                ? "Proceed to Payment →"
                : "Confirm Order →"}
        </button>
        <p className="text-center text-[10px] text-gray-500 mt-3 font-mono uppercase tracking-wider">
          {isManualPayment
            ? "Payment first · then order is created"
            : "By confirming, you agree to our terms"}
        </p>
      </div>
    </div>
  );
};

export default PlaceOrder;
