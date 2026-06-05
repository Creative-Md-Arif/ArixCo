/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetPaymentMethodsQuery,
  useSubmitManualPaymentMutation,
  useCheckTransactionIdQuery,
} from "../../redux/api/paymentApiSlice";
import { useCreateOrderMutation } from "../../redux/api/orderApiSlice";
import { useUploadProductImageMutation } from "../../redux/api/productApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";
import Loader from "../../components/Loader";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaCopy,
  FaCheckCircle,
  FaUpload,
  FaArrowLeft,
  FaInfoCircle,
  FaLock,
  FaExclamationTriangle,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";

// ==========================================
// VALIDATION RULES
// ==========================================
const VALIDATION_RULES = {
  transactionId: {
    required: true,
    minLength: 8,
    maxLength: 20,
    pattern: /^[A-Z0-9]+$/,
    message:
      "Transaction ID must be 8-20 characters (letters and numbers only)",
  },
  senderNumber: {
    required: true,
    pattern: /^01[3-9]\d{8}$/,
    message:
      "Please enter a valid Bangladeshi mobile number (11 digits starting with 01)",
  },
  screenshot: {
    required: true,
    message: "Payment screenshot is required for verification",
  },
};

// ==========================================
// CUSTOM HOOK: Debounce
// ==========================================
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// ==========================================
// MAIN COMPONENT
// ==========================================
//
// TWO MODES:
//
// 1) STANDALONE (default, existing behaviour):
//    <PaymentInstruction />
//    — reads pendingOrder from localStorage
//    — navigates via react-router on success/cancel
//
// 2) EMBEDDED (new):
//    <PaymentInstruction
//      embedded
//      pendingOrder={orderData}       ← passed directly, no localStorage read
//      onBack={() => setShowPayment(false)}    ← replaces navigate("/cart")
//      onOrderComplete={(orderId) => ...}      ← replaces navigate(`/order/${id}`)
//    />
//    — used by Shipping.jsx to show payment in the same right panel
//    — no page transition, no route change

const PaymentInstruction = ({
  embedded = false,
  pendingOrder: embeddedPendingOrder = null,
  onBack = null,
  onOrderComplete = null,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isSubmittingRef = useRef(false);
  const hasSubmittedRef = useRef(false);

  // In embedded mode: use the prop directly (no localStorage).
  // In standalone mode: load from localStorage (original behaviour).
  const [pendingOrder, setPendingOrder] = useState(
    embedded ? embeddedPendingOrder : null,
  );
  const [isDataLoaded, setIsDataLoaded] = useState(embedded);

  // Form states
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // UI states
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);
  const [transactionStatus, setTransactionStatus] = useState(null);

  // API
  const { data: paymentMethods, isLoading: methodsLoading } =
    useGetPaymentMethodsQuery();
  const [submitPayment, { isLoading: submitting }] =
    useSubmitManualPaymentMutation();
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();
  const [uploadImage, { isLoading: uploading }] =
    useUploadProductImageMutation();

  const debouncedTransactionId = useDebounce(transactionId, 500);

  const {
    data: transactionCheckData,
    isFetching: isCheckingTransaction,
    error: transactionCheckError,
    isError: isTransactionCheckError,
  } = useCheckTransactionIdQuery(debouncedTransactionId, {
    skip: !debouncedTransactionId || debouncedTransactionId.length < 8,
  });

  // Transaction check result
  useEffect(() => {
    if (transactionCheckData) {
      if (transactionCheckData.exists) {
        setTransactionStatus("duplicate");
        setErrors((p) => ({
          ...p,
          transactionId:
            "This Transaction ID has already been used. Please check and enter a unique ID.",
        }));
      } else {
        setTransactionStatus("valid");
        setErrors((p) => ({ ...p, transactionId: null }));
      }
    }
  }, [transactionCheckData]);

  // Transaction check error
  useEffect(() => {
    if (isTransactionCheckError && transactionCheckError) {
      setTransactionStatus(null);
      if (transactionCheckError.status === "FETCH_ERROR") {
        toast.error("Network error. Cannot connect to server.");
      } else if (transactionCheckError.status === 404) {
        toast.error("API endpoint not found. Please contact support.");
      } else {
        toast.error("Failed to verify transaction ID. Please try again.");
      }
    }
  }, [isTransactionCheckError, transactionCheckError]);

  // ─── STANDALONE MODE: load pendingOrder from localStorage ───────────
  useEffect(() => {
    if (embedded) return; // embedded mode skips this entirely

    try {
      const savedOrder = localStorage.getItem("pendingOrderData");

      if (!savedOrder) {
        toast.error("No pending order found! Please add items to cart first.");
        navigate("/cart");
        return;
      }

      const parsedOrder = JSON.parse(savedOrder);

      if (!parsedOrder.orderItems || parsedOrder.orderItems.length === 0) {
        toast.error("Your cart is empty!");
        navigate("/cart");
        return;
      }

      if (!parsedOrder.shippingAddress?.name) {
        toast.error("Shipping address is incomplete.");
        navigate("/shipping");
        return;
      }

      if (!parsedOrder.paymentMethod) {
        toast.error("Payment method not selected!");
        navigate("/shipping");
        return;
      }

      const submissionKey = `submitted_${parsedOrder.shippingAddress.phoneNumber}_${parsedOrder.totalPrice}`;
      if (sessionStorage.getItem(submissionKey)) {
        toast.info("This order is already being processed!");
        navigate("/orders");
        return;
      }

      setPendingOrder({
        ...parsedOrder,
        itemsPrice: parsedOrder.itemsPrice || "0.00",
        shippingPrice: parsedOrder.shippingPrice || "0.00",
        totalPrice: parsedOrder.totalPrice || "0.00",
        totalSavings: parsedOrder.totalSavings || "0.00",
        shippingAddress: {
          name: parsedOrder.shippingAddress.name || "",
          address: parsedOrder.shippingAddress.address || "",
          division: parsedOrder.shippingAddress.division || "",
          district: parsedOrder.shippingAddress.district || "",
          thana: parsedOrder.shippingAddress.thana || "",
          city: parsedOrder.shippingAddress.city || "",
          postalCode: parsedOrder.shippingAddress.postalCode || "",
          country: parsedOrder.shippingAddress.country || "Bangladesh",
          phoneNumber: parsedOrder.shippingAddress.phoneNumber || "",
        },
      });
      setIsDataLoaded(true);
    } catch (error) {
      toast.error("Failed to load order data");
      navigate("/cart");
    }
  }, [embedded, navigate]);

  // ─── EMBEDDED MODE: sync prop → state (if parent updates the order) ──
  useEffect(() => {
    if (embedded && embeddedPendingOrder) {
      setPendingOrder(embeddedPendingOrder);
      setIsDataLoaded(true);
    }
  }, [embedded, embeddedPendingOrder]);

  // ─── Navigation helpers (work in both modes) ─────────────────────────
  const handleGoBack = () => {
    if (embedded && onBack) {
      onBack(); // tells Shipping.jsx to show PlaceOrder again
    } else {
      navigate("/cart");
    }
  };

  const handleOrderSuccess = (orderId) => {
    if (embedded && onOrderComplete) {
      onOrderComplete(orderId); // tells Shipping.jsx to navigate to order page
    } else {
      navigate(`/order/${orderId}`);
    }
  };

  // ─── Validation ──────────────────────────────────────────────────────
  const validateField = useCallback((name, value) => {
    const rule = VALIDATION_RULES[name];
    if (!rule) return "";
    if (rule.required && !value)
      return rule.message || "This field is required";
    if (value && rule.minLength && value.length < rule.minLength)
      return rule.message;
    if (value && rule.maxLength && value.length > rule.maxLength)
      return rule.message;
    if (value && rule.pattern && !rule.pattern.test(value)) return rule.message;
    return "";
  }, []);

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    const txError = validateField("transactionId", transactionId);
    if (txError) {
      newErrors.transactionId = txError;
      isValid = false;
    } else if (transactionStatus === "duplicate") {
      newErrors.transactionId = "This Transaction ID has already been used";
      isValid = false;
    }

    const phoneError = validateField("senderNumber", senderNumber);
    if (phoneError) {
      newErrors.senderNumber = phoneError;
      isValid = false;
    }

    if (!screenshot) {
      newErrors.screenshot =
        "Please upload a payment screenshot for verification";
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({ transactionId: true, senderNumber: true, screenshot: true });
    return isValid;
  }, [
    transactionId,
    senderNumber,
    screenshot,
    transactionStatus,
    validateField,
  ]);

  const handleBlur = (field) => {
    setTouched((p) => ({ ...p, [field]: true }));
    const val = field === "transactionId" ? transactionId : senderNumber;
    setErrors((p) => ({ ...p, [field]: validateField(field, val) }));
  };

  // ─── Clipboard ───────────────────────────────────────────────────────
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── File upload ─────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadImage(formData).unwrap();
      setScreenshot(res.url || res.image);
      setErrors((p) => ({ ...p, screenshot: null }));
      setTouched((p) => ({ ...p, screenshot: true }));
      toast.success("Screenshot uploaded successfully!");
    } catch {
      toast.error("Failed to upload image");
      setScreenshot(null);
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmittingRef.current || hasSubmittedRef.current) {
      toast.warning("Please wait, your submission is being processed...");
      return;
    }
    if (!validateAll()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    if (!pendingOrder) {
      toast.error("Order data not found!");
      return;
    }

    try {
      isSubmittingRef.current = true;
      setStep(2);

      const orderRes = await createOrder(pendingOrder).unwrap();
      hasSubmittedRef.current = true;

      const submissionKey = `submitted_${pendingOrder.shippingAddress.phoneNumber}_${pendingOrder.totalPrice}`;
      sessionStorage.setItem(submissionKey, orderRes._id);

      await submitPayment({
        orderId: orderRes._id,
        data: {
          transactionId: transactionId.trim().toUpperCase(),
          senderNumber: senderNumber.trim(),
          selectedPaymentMethod: pendingOrder.paymentMethod,
          sentAmount: pendingOrder.totalPrice,
          paymentScreenshot: screenshot || "",
        },
      }).unwrap();

      dispatch(clearCartItems());
      localStorage.removeItem("pendingOrderData");
      localStorage.removeItem("shippingAddress");

      toast.success("Payment submitted and order created successfully! 📦");
      handleOrderSuccess(orderRes._id); // ← works in both modes
    } catch (err) {
      setStep(1);
      isSubmittingRef.current = false;

      if (
        err?.data?.message?.includes("Transaction ID") ||
        err?.data?.message?.includes("already been used")
      ) {
        setTransactionStatus("duplicate");
        setErrors((p) => ({
          ...p,
          transactionId: "This Transaction ID has already been used!",
        }));
      }

      toast.error(
        err?.data?.message || "Failed to process payment. Please try again.",
      );
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure? Your order will not be placed.")) {
      handleGoBack(); // ← works in both modes
    }
  };

  const selectedMethod = paymentMethods?.find(
    (m) => m.type === pendingOrder?.paymentMethod,
  );

  // ─── Loading state ────────────────────────────────────────────────────
  if (methodsLoading || !isDataLoaded) {
    return (
      <div
        className={`flex items-center justify-center ${embedded ? "min-h-[300px]" : "min-h-screen"}`}
      >
        <Loader />
      </div>
    );
  }

  if (!selectedMethod) {
    return (
      <div
        className={`px-4 text-center ${embedded ? "py-10" : "container mx-auto mt-[100px]"}`}
      >
        <h2 className="text-xl font-mono font-black text-red-600 mb-4">
          Payment Method Not Available
        </h2>
        <button
          onClick={handleGoBack}
          className="px-6 py-3 bg-black text-white font-mono font-bold text-sm uppercase tracking-widest"
        >
          Go Back &amp; Select Again
        </button>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────
  // In embedded mode: no top breadcrumb/header area, no outer padding for page.
  // In standalone mode: full page layout with mt-[100px].
  const containerClass = embedded
    ? "w-full"
    : "bg-[#FDFDFD] min-h-screen pb-20";

  const innerClass = embedded
    ? "w-full"
    : "container mx-auto px-4 mt-[100px] max-w-4xl";

  return (
    <div className={containerClass}>
      <div className={innerClass}>
        {/* ── Back button (embedded only — standalone has browser back) ── */}
        {embedded && (
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 mb-5"
          >
            <FaArrowLeft size={10} /> Back to order
          </button>
        )}

        {/* ── Header (standalone only) ── */}
        {!embedded && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-black px-4 py-2 mb-4">
              <FaLock className="text-white text-sm" />
              <span className="text-white font-mono text-xs font-bold uppercase tracking-widest">
                Secure Payment
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-mono font-black uppercase tracking-tight mb-4">
              Pay with{" "}
              <span className="underline underline-offset-4">
                {selectedMethod.type}
              </span>
            </h1>
            <div className="bg-white p-6 border border-gray-200 inline-block">
              <p className="text-gray-500 font-mono text-sm mb-2">
                Total Amount to Pay
              </p>
              <p className="text-4xl font-mono font-black text-black">
                ৳{pendingOrder?.totalPrice || "0.00"}
              </p>
            </div>
          </div>
        )}

        {/* ── Embedded header ── */}
        {embedded && (
          <div className="border-b border-black pb-4 mb-6">
            <p className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-gray-400 mb-1">
              Step 2 of 2
            </p>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-mono font-black text-black uppercase tracking-tight">
                Pay via {selectedMethod.type}
              </h2>
              <div className="text-right">
                <p className="text-[9px] font-mono uppercase tracking-widest text-gray-400">
                  Amount Due
                </p>
                <p className="text-xl font-mono font-black text-black">
                  ৳{pendingOrder?.totalPrice || "0.00"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Processing Overlay ── */}
        {step === 2 && (
          <div className="fixed inset-0 bg-white/95 z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-mono font-black mb-1 uppercase tracking-tight">
                Processing Payment
              </h3>
              <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">
                Do not close or refresh
              </p>
            </div>
          </div>
        )}

        {/* ── Main grid ── */}
        <div
          className={`grid grid-cols-1 gap-8 ${embedded ? "" : "lg:grid-cols-2"}`}
        >
          {/* Instructions */}
          <div className="space-y-4">
            <p className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">
              Payment Instructions
            </p>

            {/* Account card */}
            <div className="border-2 border-black p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-black flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-mono font-black text-xl">
                    {selectedMethod.type[0]}
                  </span>
                </div>
                <div>
                  <p className="font-mono font-black text-xl text-black">
                    {selectedMethod.type}
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    {selectedMethod.accountType} Account
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-400 mb-2">
                  Send Money To
                </p>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono font-black text-2xl tracking-wider text-black">
                      {selectedMethod.number}
                    </p>
                    <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                      {selectedMethod.accountName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedMethod.number)}
                    className="w-10 h-10 bg-black text-white flex items-center justify-center flex-shrink-0"
                  >
                    {copied ? (
                      <FaCheckCircle size={14} />
                    ) : (
                      <FaCopy size={14} />
                    )}
                  </button>
                </div>
              </div>

              {selectedMethod.instructions && (
                <div className="p-3 bg-gray-50 border border-gray-200 flex items-start gap-2">
                  <FaInfoCircle
                    className="text-gray-400 mt-0.5 flex-shrink-0"
                    size={12}
                  />
                  <p className="text-[10px] font-mono text-gray-600">
                    {selectedMethod.instructions}
                  </p>
                </div>
              )}
            </div>

            {/* Step guide */}
            <div className="border border-gray-200 p-4">
              <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                How to pay via {selectedMethod.type}
              </p>
              <ol className="space-y-2">
                {[
                  `Open your ${selectedMethod.type} app`,
                  "Select Send Money",
                  `Enter number: ${selectedMethod.number}`,
                  `Enter amount: ৳${pendingOrder?.totalPrice || "0.00"}`,
                  "Complete payment & copy the Transaction ID",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[8px] font-mono font-black text-white bg-black w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[11px] font-mono text-gray-600">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Payment form */}
          <div className="border border-gray-200 p-6">
            <p className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-gray-400 mb-5">
              Confirm Your Payment
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Transaction ID */}
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                  Transaction ID (TrxID) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => {
                      const val = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "");
                      setTransactionId(val);
                      setTransactionStatus(null);
                    }}
                    onBlur={() => handleBlur("transactionId")}
                    placeholder="8A9B2C3D"
                    className={`w-full px-4 py-3 bg-white border font-mono text-sm uppercase tracking-wider outline-none transition-colors ${
                      errors.transactionId && touched.transactionId
                        ? "border-red-400"
                        : transactionStatus === "valid"
                          ? "border-green-400"
                          : "border-gray-200 focus:border-black"
                    }`}
                    required
                    minLength={8}
                    maxLength={20}
                    disabled={step === 2}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                    {isCheckingTransaction ? (
                      <FaSpinner className="animate-spin text-gray-400" />
                    ) : transactionStatus === "valid" ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : transactionStatus === "duplicate" ? (
                      <FaTimesCircle className="text-red-500" />
                    ) : null}
                  </div>
                </div>

                <AnimatePresence>
                  {errors.transactionId && touched.transactionId && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-1.5 text-[9px] font-mono text-red-500 uppercase tracking-wide flex items-center gap-1"
                    >
                      <FaExclamationTriangle size={8} /> {errors.transactionId}
                    </motion.p>
                  )}
                </AnimatePresence>

                {transactionStatus === "valid" && (
                  <p className="mt-1.5 text-[9px] font-mono text-green-600 uppercase tracking-wide flex items-center gap-1">
                    <FaCheckCircle size={8} /> Transaction ID is available
                  </p>
                )}
                <p className="mt-1 text-[9px] text-gray-400 font-mono">
                  Found in your SMS or app history (8–20 characters)
                </p>
              </div>

              {/* Sender number */}
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                  Your {selectedMethod.type} Number *
                </label>
                <input
                  type="tel"
                  value={senderNumber}
                  onChange={(e) =>
                    setSenderNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 11),
                    )
                  }
                  onBlur={() => handleBlur("senderNumber")}
                  placeholder="01XXXXXXXXX"
                  className={`w-full px-4 py-3 bg-white border font-mono text-sm outline-none transition-colors ${
                    errors.senderNumber && touched.senderNumber
                      ? "border-red-400"
                      : "border-gray-200 focus:border-black"
                  }`}
                  required
                  maxLength={11}
                  disabled={step === 2}
                />
                <AnimatePresence>
                  {errors.senderNumber && touched.senderNumber && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-1.5 text-[9px] font-mono text-red-500 uppercase tracking-wide flex items-center gap-1"
                    >
                      <FaExclamationTriangle size={8} /> {errors.senderNumber}
                    </motion.p>
                  )}
                </AnimatePresence>
                <p className="mt-1 text-[9px] text-gray-400 font-mono">
                  Number you used to send money
                </p>
              </div>

              {/* Screenshot */}
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                  Payment Screenshot *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="screenshot-upload"
                  disabled={uploading || step === 2}
                />
                <label
                  htmlFor="screenshot-upload"
                  className={`flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed cursor-pointer transition-colors ${
                    uploading
                      ? "border-gray-400 bg-gray-50"
                      : screenshot
                        ? "border-black bg-white"
                        : "border-gray-300 bg-white"
                  }`}
                >
                  {uploading ? (
                    <span className="font-mono text-xs text-gray-500 flex items-center gap-2 uppercase tracking-widest">
                      <FaSpinner className="animate-spin" /> Uploading...
                    </span>
                  ) : screenshot ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={screenshot}
                        alt="Preview"
                        className="h-12 w-12 object-cover border border-gray-200"
                      />
                      <span className="font-mono text-xs text-black flex items-center gap-2 uppercase tracking-widest">
                        <FaCheckCircle /> Screenshot Uploaded
                      </span>
                    </div>
                  ) : (
                    <>
                      <FaUpload className="text-gray-400" size={14} />
                      <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                        Upload Payment Screenshot
                      </span>
                    </>
                  )}
                </label>
                <AnimatePresence>
                  {errors.screenshot && touched.screenshot && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-1.5 text-[9px] font-mono text-red-500 uppercase tracking-wide flex items-center gap-1"
                    >
                      <FaExclamationTriangle size={8} /> {errors.screenshot}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Buttons */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    uploading ||
                    creatingOrder ||
                    isCheckingTransaction ||
                    transactionStatus === "duplicate" ||
                    !screenshot
                  }
                  className={`w-full py-4 font-mono font-black text-[11px] uppercase tracking-[0.25em] transition-none flex items-center justify-center gap-2 ${
                    submitting ||
                    uploading ||
                    creatingOrder ||
                    isCheckingTransaction ||
                    transactionStatus === "duplicate" ||
                    !screenshot
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-black text-white"
                  }`}
                >
                  {submitting || creatingOrder ? (
                    <>
                      <FaSpinner className="animate-spin" /> Processing...
                    </>
                  ) : uploading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Uploading...
                    </>
                  ) : isCheckingTransaction ? (
                    <>
                      <FaSpinner className="animate-spin" /> Checking...
                    </>
                  ) : transactionStatus === "duplicate" ? (
                    <>
                      <FaTimesCircle /> Duplicate Transaction ID
                    </>
                  ) : !screenshot ? (
                    <>
                      <FaUpload /> Upload Screenshot First
                    </>
                  ) : (
                    <>
                      <FaLock /> Pay ৳{pendingOrder?.totalPrice || "0.00"} &amp;
                      Confirm
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={step === 2}
                  className="w-full py-3 border border-gray-200 text-gray-500 font-mono font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <FaArrowLeft size={10} /> Back to Cart
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInstruction;
