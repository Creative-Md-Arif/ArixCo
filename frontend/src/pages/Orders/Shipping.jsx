/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  saveShippingAddress,
  savePaymentMethod,
} from "../../redux/features/cart/cartSlice";
import PlaceOrder from "./PlaceOrder";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaMoneyBillWave,
  FaMoneyBillWaveAlt,
  FaUniversity,
  FaSpinner,
} from "react-icons/fa";

// ✅ BD Location Data Import
import bd from "@bd-geo-data/bd-location-data";
// ✅ Dynamic Shipping API Import
import { useCalculateShippingMutation } from "@redux/api/shippingApiSlice";

/* ─── helpers ─────────────────────────────────────────────── */
const getItemFinalPrice = (item) =>
  Number(item._finalPrice) ||
  Number(item._effectivePrice) ||
  Number(item.finalPrice) ||
  Number(item.price) ||
  0;

const getItemBasePrice = (item) =>
  Number(item.basePrice) || Number(item.price) || 0;

/* ─── Field ───────────────────────────────────────────────── */
const Field = ({ label, error, touched, children }) => (
  <div>
    <label className="block text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.25em] text-gray-400 mb-2">
      {label}
    </label>
    {children}
    {error && touched && (
      <p className="mt-1.5 text-[11px] sm:text-xs font-mono text-red-500 uppercase tracking-wide">
        ⚠ {error}
      </p>
    )}
  </div>
);

const inputBase =
  "w-full px-4 py-3 bg-white border font-mono text-sm text-black placeholder-gray-300 outline-none focus:border-black transition-colors";

const inputStyle = (fieldName, errors, touched) =>
  `${inputBase} ${
    errors[fieldName] && touched[fieldName]
      ? "border-red-400"
      : "border-gray-200 focus:border-black"
  }`;

/* ─── Shipping ─────────────────────────────────────────────── */
const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { cartItems, shippingAddress } = cart;
  const dispatch = useDispatch();

  // ✅ Dynamic Shipping Hook
  const [calculateShipping, { isLoading: isCalculating }] =
    useCalculateShippingMutation();

  // ✅ Debounce ref to avoid excessive API calls
  const shippingDebounceRef = useRef(null);

  const getSaved = () => {
    try {
      const s = localStorage.getItem("shippingAddress");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  };

  const init = shippingAddress || getSaved() || {};

  const [name, setName] = useState(init.name || "");
  const [address, setAddress] = useState(init.address || "");

  // ✅ Location States
  const [division, setDivision] = useState(init.division || "");
  const [district, setDistrict] = useState(init.district || "");
  const [thana, setThana] = useState(init.thana || "");

  const [postalCode, setPostalCode] = useState(init.postalCode || "");
  const [country, setCountry] = useState(init.country || "Bangladesh");
  const [phoneNumber, setPhoneNumber] = useState(init.phoneNumber || "");
  const [paymentMethod, setPaymentMethod] = useState(
    init.paymentMethod || "Cash on Delivery",
  );

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shippingCharge: 0,
    totalPrice: 0,
    totalSavings: 0,
    shippingMethodName: "",
    estimatedDays: "",
    isFreeShipping: false,
  });

  // ✅ BD Location Data
  const divisionsEn = bd.allDivisions("en");
  const divisionsBn = bd.allDivisions("bn");

  const [districtsList, setDistrictsList] = useState([]);
  const [thanasList, setThanasList] = useState([]);

  // ✅ Fetch Districts based on Division
  useEffect(() => {
    if (division) {
      const dEn = bd.districtsOf(division, "en");
      const dBn = bd.districtsOf(division, "bn");
      setDistrictsList(dEn.map((en, i) => ({ en, bn: dBn[i] })));
      setDistrict("");
      setThana("");
      setThanasList([]);
    } else {
      setDistrictsList([]);
      setDistrict("");
      setThana("");
      setThanasList([]);
    }
  }, [division]);

  // ✅ Fetch Thanas based on District
  useEffect(() => {
    if (district) {
      const tEn = bd.thanasOf(district, "en");
      const tBn = bd.thanasOf(district, "bn");
      setThanasList(tEn.map((en, i) => ({ en, bn: tBn[i] })));
      setThana("");
    } else {
      setThanasList([]);
      setThana("");
    }
  }, [district]);

  /* ── Validation ── */
  const validateField = (field, value) => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 3) return "Min 3 characters";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Letters and spaces only";
        return "";
      case "phoneNumber":
        if (!value.trim()) return "Phone number is required";
        if (!/^01[3-9]\d{8}$/.test(value))
          return "Valid Bangladeshi number required (01XXXXXXXXX)";
        return "";
      case "address":
        if (!value.trim()) return "Full address is required";
        if (value.trim().length < 10) return "Min 10 characters";
        return "";
      case "division":
        if (!value) return "Please select a division";
        return "";
      case "district":
        if (!value) return "Please select a district";
        return "";
      case "thana":
        if (!value) return "Please select a thana";
        return "";
      case "postalCode":
        if (!value.trim()) return "Postal code is required";
        if (!/^\d{4}$/.test(value)) return "4-digit code required";
        return "";
      case "country":
        if (!value.trim()) return "Country is required";
        return "";
      case "paymentMethod":
        if (!value) return "Select a payment method";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (field, raw) => {
    let value = raw;
    if (field === "phoneNumber") value = raw.replace(/\D/g, "").slice(0, 11);
    if (field === "postalCode") value = raw.replace(/\D/g, "").slice(0, 4);

    const setters = {
      name: setName,
      address: setAddress,
      division: setDivision,
      district: setDistrict,
      thana: setThana,
      postalCode: setPostalCode,
      country: setCountry,
      phoneNumber: setPhoneNumber,
    };

    if (setters[field]) setters[field](value);

    if (touched[field]) {
      setErrors((p) => ({ ...p, [field]: validateField(field, value) }));
    }
  };

  const handlePaymentChange = (id) => {
    setPaymentMethod(id);
    dispatch(savePaymentMethod(id));
    if (touched.paymentMethod) {
      setErrors((p) => ({
        ...p,
        paymentMethod: validateField("paymentMethod", id),
      }));
    }
    const pending = localStorage.getItem("pendingOrderData");
    if (pending) {
      try {
        localStorage.setItem(
          "pendingOrderData",
          JSON.stringify({ ...JSON.parse(pending), paymentMethod: id }),
        );
        // eslint-disable-next-line no-empty
      } catch {}
    }
  };

  const handleBlur = (field, value) => {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors((p) => ({ ...p, [field]: validateField(field, value) }));
  };

  const validateAll = () => {
    const fields = {
      name,
      phoneNumber,
      address,
      division,
      district,
      thana,
      postalCode,
      country,
      paymentMethod,
    };
    const newErrors = {};
    Object.keys(fields).forEach((f) => {
      const e = validateField(f, fields[f]);
      if (e) newErrors[f] = e;
    });
    setErrors(newErrors);
    setTouched(Object.fromEntries(Object.keys(fields).map((f) => [f, true])));
    return Object.keys(newErrors).length === 0;
  };

  /* ── Persist to localStorage ── */
  useEffect(() => {
    if (name || phoneNumber || address || division || postalCode || country) {
      localStorage.setItem(
        "shippingAddress",
        JSON.stringify({
          name,
          address,
          division,
          district,
          thana,
          postalCode,
          country,
          phoneNumber,
          paymentMethod,
        }),
      );
    }
  }, [
    name,
    address,
    division,
    district,
    thana,
    postalCode,
    country,
    phoneNumber,
    paymentMethod,
  ]);

  useEffect(() => {
    const saved = getSaved();
    if (saved && !shippingAddress?.name) {
      dispatch(saveShippingAddress(saved));
      dispatch(savePaymentMethod(saved.paymentMethod || "Cash on Delivery"));
    }
  }, []);

  // ✅ Dynamic Shipping Calculation Effect
  useEffect(() => {
    const subtotal = cartItems.reduce(
      (a, item) => a + getItemFinalPrice(item) * (Number(item.qty) || 1),
      0,
    );
    const savings = cartItems.reduce(
      (a, item) =>
        a +
        (getItemBasePrice(item) - getItemFinalPrice(item)) *
          (Number(item.qty) || 1),
      0,
    );

    if (thana && district && division && cartItems.length > 0) {
      if (shippingDebounceRef.current) {
        clearTimeout(shippingDebounceRef.current);
      }

      shippingDebounceRef.current = setTimeout(async () => {
        try {
          const orderItemsData = cartItems.map((item) => ({
            product: item._id || item.product,
            category: item.category,
            qty: Number(item.qty) || 1,
            weight: Number(item.weight) || 0,
            shippingDetails: item.shippingDetails || {},
          }));

          const res = await calculateShipping({
            thana: thana.trim(),
            district: district.trim(),
            division: division.trim(),
            orderItems: orderItemsData,
            subtotal,
          }).unwrap();

          setOrderSummary({
            subtotal,
            shippingCharge: res.shippingCost,
            totalPrice: subtotal + res.shippingCost,
            totalSavings: savings,
            shippingMethodName: res.zoneName || "Standard Delivery",
            estimatedDays: res.estimatedDays || "3-5 Days",
            isFreeShipping: res.isFreeShipping || false,
          });
        } catch (err) {
          console.error("Shipping Calculation API Error:", err);
          toast.error(
            err?.data?.error || "Could not calculate shipping. Using default.",
          );
          setOrderSummary({
            subtotal,
            shippingCharge: 150,
            totalPrice: subtotal + 150,
            totalSavings: savings,
            shippingMethodName: "Standard Delivery",
            estimatedDays: "3-5 Days",
            isFreeShipping: false,
          });
        }
      }, 400);
    } else {
      setOrderSummary({
        subtotal,
        shippingCharge: 0,
        totalPrice: subtotal,
        totalSavings: savings,
        shippingMethodName: "",
        estimatedDays: "",
        isFreeShipping: false,
      });
    }

    return () => {
      if (shippingDebounceRef.current) {
        clearTimeout(shippingDebounceRef.current);
      }
    };
  }, [division, district, thana, cartItems]);

  const handleShippingDetails = () => {
    if (!validateAll()) {
      toast.error("Please fill all required fields correctly!");
      return null;
    }
    const data = {
      name,
      address,
      division: division.trim(),
      district: district.trim(),
      thana: thana.trim(),
      city: thana.trim(),
      postalCode: postalCode.trim(),
      country: country.trim() || "Bangladesh",
      phoneNumber,
      shippingCharge: orderSummary.shippingCharge,
      paymentMethod,
    };
    dispatch(saveShippingAddress(data));
    dispatch(savePaymentMethod(paymentMethod));
    localStorage.setItem("shippingAddress", JSON.stringify(data));
    return data;
  };

  const paymentMethods = [
    {
      id: "Cash on Delivery",
      label: "Cash on Delivery",
      sub: "Pay when received",
      icon: <FaMoneyBillWave />,
    },
    {
      id: "bKash",
      label: "bKash",
      sub: "Pay now",
      icon: <FaMoneyBillWaveAlt />,
    },
    {
      id: "Nagad",
      label: "Nagad",
      sub: "Pay now",
      icon: <FaMoneyBillWaveAlt />,
    },
    {
      id: "Rocket",
      label: "Rocket",
      sub: "Pay now",
      icon: <FaMoneyBillWaveAlt />,
    },
    {
      id: "Bank",
      label: "Bank Transfer",
      sub: "Pay now",
      icon: <FaUniversity />,
    },
  ];

  console.log(cart);

  return (
    <div className="bg-white min-h-screen">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-[0.2em]">
          <Link
            to="/"
            className="text-gray-400 hover:text-black transition-colors"
          >
            Home
          </Link>
          <span className="text-gray-200">/</span>
          <Link
            to="/cart"
            className="text-gray-400 hover:text-black transition-colors"
          >
            Cart
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-black font-bold">Checkout</span>
        </div>
      </div>

      <div className="container mx-auto py-8 sm:py-10 px-4 sm:px-6">
        {/* ── Page Header ── */}
        <div className="mb-8 sm:mb-10 border-b-2 border-black pb-4">
          <p className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.35em] text-gray-400 mb-1">
            Step 1 of 2
          </p>
          <h1 className="text-3xl sm:text-4xl font-mono font-black text-black uppercase tracking-tight">
            Checkout
          </h1>
        </div>

        <div className="flex flex-col xl:flex-row gap-10 xl:gap-12">
          {/* ── Left Column ── */}
          <div className="w-full xl:w-7/12 space-y-8">
            {/* ── Section 01: Delivery Details ── */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.3em] text-white bg-black px-2 py-1">
                  01
                </span>
                <h2 className="text-lg sm:text-xl font-mono font-black text-black uppercase tracking-tight">
                  Delivery Details
                </h2>
              </div>

              <div className="space-y-5">
                {/* Full Name */}
                <Field
                  label="Full Name"
                  error={errors.name}
                  touched={touched.name}
                >
                  <input
                    type="text"
                    className={inputStyle("name", errors, touched)}
                    value={name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={(e) => handleBlur("name", e.target.value)}
                    placeholder="Receiver's full name"
                  />
                </Field>

                {/* Phone + Division */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field
                    label="Phone Number"
                    error={errors.phoneNumber}
                    touched={touched.phoneNumber}
                  >
                    <input
                      type="tel"
                      className={inputStyle("phoneNumber", errors, touched)}
                      value={phoneNumber}
                      onChange={(e) =>
                        handleChange("phoneNumber", e.target.value)
                      }
                      onBlur={(e) => handleBlur("phoneNumber", e.target.value)}
                      placeholder="01XXX-XXXXXX"
                    />
                  </Field>

                  {/* ✅ Division Select */}
                  <Field
                    label="Division"
                    error={errors.division}
                    touched={touched.division}
                  >
                    <select
                      value={division}
                      onChange={(e) => handleChange("division", e.target.value)}
                      onBlur={(e) => handleBlur("division", e.target.value)}
                      className={inputStyle("division", errors, touched)}
                    >
                      <option value="">Select division</option>
                      {divisionsEn.map((div, i) => (
                        <option key={div} value={div}>
                          {divisionsBn[i]} ({div})
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* District + Thana */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field
                    label="District"
                    error={errors.district}
                    touched={touched.district}
                  >
                    <select
                      value={district}
                      onChange={(e) => handleChange("district", e.target.value)}
                      onBlur={(e) => handleBlur("district", e.target.value)}
                      className={inputStyle("district", errors, touched)}
                      disabled={!division}
                    >
                      <option value="">Select district</option>
                      {districtsList.map((dist) => (
                        <option key={dist.en} value={dist.en}>
                          {dist.bn} ({dist.en})
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="Thana / Upazila"
                    error={errors.thana}
                    touched={touched.thana}
                  >
                    <div className="relative">
                      <select
                        value={thana}
                        onChange={(e) => handleChange("thana", e.target.value)}
                        onBlur={(e) => handleBlur("thana", e.target.value)}
                        className={inputStyle("thana", errors, touched)}
                        disabled={!district}
                      >
                        <option value="">Select thana</option>
                        {thanasList.map((t) => (
                          <option key={t.en} value={t.en}>
                            {t.bn} ({t.en})
                          </option>
                        ))}
                      </select>
                      {/* ✅ Shipping calculating indicator */}
                      {isCalculating && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <FaSpinner className="animate-spin text-gray-400 text-sm" />
                        </div>
                      )}
                    </div>
                    {/* ✅ Shipping calculation status */}
                    {thana && district && division && (
                      <p className="mt-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wide text-gray-400">
                        {isCalculating
                          ? "⟳ Calculating shipping..."
                          : `✓ Shipping: ৳${orderSummary.shippingCharge}`}
                      </p>
                    )}
                  </Field>
                </div>

                {/* Full Address */}
                <Field
                  label="Full Address"
                  error={errors.address}
                  touched={touched.address}
                >
                  <input
                    type="text"
                    className={inputStyle("address", errors, touched)}
                    value={address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    onBlur={(e) => handleBlur("address", e.target.value)}
                    placeholder="House / Road / Area"
                  />
                </Field>

                {/* Postal Code + Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field
                    label="Postal Code"
                    error={errors.postalCode}
                    touched={touched.postalCode}
                  >
                    <input
                      type="text"
                      className={inputStyle("postalCode", errors, touched)}
                      value={postalCode}
                      onChange={(e) =>
                        handleChange("postalCode", e.target.value)
                      }
                      onBlur={(e) => handleBlur("postalCode", e.target.value)}
                      placeholder="1200"
                    />
                  </Field>
                  <Field
                    label="Country"
                    error={errors.country}
                    touched={touched.country}
                  >
                    <input
                      type="text"
                      className={inputStyle("country", errors, touched)}
                      value={country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      onBlur={(e) => handleBlur("country", e.target.value)}
                      placeholder="Bangladesh"
                    />
                  </Field>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-100" />

            {/* ── Section 02: Payment Method ── */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.3em] text-white bg-black px-2 py-1">
                  02
                </span>
                <h2 className="text-lg sm:text-xl font-mono font-black text-black uppercase tracking-tight">
                  Payment Method
                </h2>
              </div>

              {errors.paymentMethod && touched.paymentMethod && (
                <p className="mb-4 text-[11px] sm:text-xs font-mono text-red-500 uppercase tracking-wide">
                  ⚠ {errors.paymentMethod}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((m) => {
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handlePaymentChange(m.id)}
                      className={`flex items-center gap-4 px-4 py-4 border-2 text-left transition-none ${active ? "border-black bg-black text-white" : "border-gray-200 bg-white text-black"}`}
                    >
                      <span
                        className={`text-xl sm:text-2xl ${active ? "text-white" : "text-gray-400"}`}
                      >
                        {m.icon}
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-mono font-black uppercase tracking-tight">
                          {m.label}
                        </p>
                        <p
                          className={`text-[11px] sm:text-xs font-mono uppercase tracking-wide mt-0.5 ${active ? "text-gray-300" : "text-gray-400"}`}
                        >
                          {m.sub}
                        </p>
                      </div>
                      {active && (
                        <div className="ml-auto w-4 h-4 border-2 border-white rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Payment Summary */}
              <div className="mt-4 p-4 bg-gray-50 border border-gray-100 flex items-center gap-3">
                <div className="w-1 h-8 bg-black flex-shrink-0" />
                <div>
                  <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-gray-400 mb-0.5">
                    Selected
                  </p>
                  <p className="text-sm sm:text-base font-mono font-black text-black uppercase">
                    {paymentMethods.find((m) => m.id === paymentMethod)?.label}
                  </p>
                  <p className="text-[11px] sm:text-xs font-mono text-gray-500 mt-0.5">
                    {paymentMethod === "Cash on Delivery"
                      ? `Pay ৳${orderSummary.totalPrice.toFixed(2)} on delivery`
                      : "You will be redirected to payment instructions"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ── Right Column: Order Summary ── */}
          <div className="w-full xl:w-5/12">
            <div className="sticky top-[120px]">
              {/* ✅ Pass isCalculating so PlaceOrder can disable button during calculation */}
              <PlaceOrder
                orderSummary={orderSummary}
                onPlaceOrder={handleShippingDetails}
                isShippingCalculating={isCalculating}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
