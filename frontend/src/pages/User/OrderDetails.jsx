/* eslint-disable react/prop-types */
import { useState } from "react";
import { useParams, Link, NavLink } from "react-router-dom";
import { useGetOrderDetailsQuery } from "@redux/api/orderApiSlice";
import { useRequestOrderReturnMutation } from "@redux/api/returnApiSlice";
import { FaHome } from "react-icons/fa";
import { HiChevronRight } from "react-icons/hi";
import { BsPersonCircle, BsBagCheck, BsArrowLeft, BsImage } from "react-icons/bs";
import { FaTruck, FaRotateLeft } from "react-icons/fa6";
import Message from "../../components/Message";
import { toast } from "react-toastify";

/* ── Custom Skeleton Loader ── */
const DetailSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden font-trebuchet">
    <div className="px-4 sm:px-8 py-6 border-b border-gray-100">
      <div className="h-6 w-48 bg-gray-100 rounded-lg animate-pulse mb-2" />
      <div className="h-3 w-64 bg-gray-50 rounded animate-pulse" />
    </div>
    <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />
        <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />
      </div>
      <div className="space-y-4">
        <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
        <div className="h-28 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

/* ── ছোট helper: key-value info সারি (table row) ── */
const InfoRow = ({ label, value, valueClass = "" }) => (
  <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
    <td className="py-2.5 pr-3 text-[14px] font-trebuchet text-gray-500 whitespace-nowrap align-top">
      {label}
    </td>
    <td className={`py-2.5 text-[14px] font-trebuchet font-semibold text-gray-900 text-right ${valueClass}`}>
      {value}
    </td>
  </tr>
);

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

const OrderDetails = () => {
  const { id } = useParams();
  const { data: order, isLoading, error, refetch } = useGetOrderDetailsQuery(id);
  const [requestReturn, { isLoading: isReturning }] = useRequestOrderReturnMutation();

  console.log(order);
  

  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnDesc, setReturnDesc] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnImages, setReturnImages] = useState([]);

  const isReturnable =
    order?.isDelivered === "Delivered" &&
    !order?.hasActiveReturn &&
    order?.paymentStatus !== "refunded" &&
    order?.isDelivered !== "Returned";

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (returnImages.length + files.length > 5) {
      return toast.error("You can upload a maximum of 5 images.");
    }
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setReturnImages((prev) => [...prev, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setReturnImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleItemToggle = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) return toast.error("Please select at least one item");
    if (!returnReason) return toast.error("Please provide a return reason");

    try {
      const payload = {
        orderId: order._id,
        body: {
          items: selectedItems.map((pid) => {
            const originalItem = order.orderItems.find((item) => item.product.toString() === pid);
            return {
              productId: pid,
              qty: originalItem ? originalItem.qty : 1,
            };
          }),
          returnReason,
          returnDescription: returnDesc,
          returnImages: returnImages,
        },
      };
      await requestReturn(payload).unwrap();
      toast.success("Return request submitted successfully!");
      setShowReturnForm(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.error || "Failed to submit return");
    }
  };

  /**
   * ✅ চেকআউট থেকে যা সেভ হয়েছে সেটাই সরাসরি দেখানো হচ্ছে —
   * কোনো frontend recalculation বা "old price" strike-through নেই।
   */
  const getItemPrice = (item) => Number(item.finalPrice ?? item.price ?? 0);

  if (isLoading)
    return (
      <div className="bg-[#F9FAFB] min-h-screen pt-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <DetailSkeleton />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="bg-[#F9FAFB] min-h-screen pt-10 flex items-center justify-center p-4">
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      </div>
    );

  if (!order)
    return (
      <div className="bg-[#F9FAFB] min-h-screen pt-10 flex items-center justify-center p-4">
        <Message variant="danger">Order not found</Message>
      </div>
    );

  return (
    <div className="bg-[#F9FAFB] min-h-screen pt-10 font-trebuchet">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[14px] font-trebuchet font-medium flex-wrap py-4 bg-white"
          >
            <Link to="/" className="flex items-center gap-1.5 text-black hover:underline text-[14px] font-medium">
              <FaHome className="text-[14px]" />
              <span>Home</span>
            </Link>
            <span className="contents">
              <HiChevronRight className="text-[14px] text-black flex-shrink-0" />
              <Link to="/profile" className="text-black hover:underline text-[14px] font-medium">
                Profile
              </Link>
            </span>
            <span className="contents">
              <HiChevronRight className="text-[14px] text-black flex-shrink-0" />
              <Link to="/user-orders" className="text-black hover:underline text-[14px] font-medium">
                Orders
              </Link>
            </span>
            <span className="contents">
              <HiChevronRight className="text-[14px] text-black flex-shrink-0" />
              <span className="text-black font-black text-[14px]">#{order.orderId}</span>
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-px max-w-5xl mx-auto">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 text-[14px] font-trebuchet font-bold uppercase tracking-wide transition-colors rounded-t-lg whitespace-nowrap ${
                isActive ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <BsPersonCircle className="text-sm" /> Profile
          </NavLink>
          <NavLink
            to="/user-orders"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 text-[14px] font-trebuchet font-bold uppercase tracking-wide transition-colors rounded-t-lg whitespace-nowrap ${
                isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
              }`
            }
          >
            <BsBagCheck className="text-sm" /> Orders
          </NavLink>
        </div>

        <div className="max-w-5xl mx-auto space-y-5">
          {/* Header Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-lg sm:text-2xl font-trebuchet font-black text-gray-900 uppercase tracking-tight">
                Order <span className="text-blue-600">#{order.orderId}</span>
              </h1>
              <p className="text-gray-400 text-[14px] font-trebuchet mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span
                className={`text-[14px] font-trebuchet font-bold px-3 py-1.5 rounded-full uppercase border ${
                  order.paymentStatus === "paid"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-red-50 text-red-500 border-red-200"
                }`}
              >
                Pay: {order.paymentStatus ?? "N/A"}
              </span>
              <span
                className={`text-[14px] font-trebuchet font-bold px-3 py-1.5 rounded-full uppercase border ${
                  order.isDelivered === "Delivered"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : order.isDelivered === "Returned"
                    ? "bg-orange-50 text-orange-600 border-orange-200"
                    : "bg-blue-50 text-blue-600 border-blue-100"
                }`}
              >
                {order.isDelivered ?? "N/A"}
              </span>
            </div>
          </div>

          {/* Tracking Alert */}
          {order.courierTrackingId && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FaTruck className="text-blue-600 text-xl shrink-0" />
                <div>
                  <p className="font-trebuchet font-bold text-blue-900 text-[14px]">Package Shipped</p>
                  <p className="text-blue-700 text-[14px]">
                    Tracking ID: <span className="font-bold">{order.courierTrackingId}</span> via{" "}
                    {order.courierName || "Courier"}
                  </p>
                </div>
              </div>
              <Link
                to={`/track-order?orderId=${order.orderId}&email=${order.user?.email}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[14px] font-trebuchet font-bold uppercase tracking-wide hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Track Live
              </Link>
            </div>
          )}

          {/* ── Order Items Table ── */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
              <h3 className="font-trebuchet font-black text-gray-900 text-[14px] uppercase tracking-wide">
                Order Items ({order.orderItems.length})
              </h3>
            </div>

            {/* 320px থেকেও ভাঙবে না — horizontal scroll fallback */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-[14px] font-trebuchet font-bold text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="text-center py-3 px-3 text-[14px] font-trebuchet font-bold text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="text-right py-3 px-3 text-[14px] font-trebuchet font-bold text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="text-right py-3 px-4 text-[14px] font-trebuchet font-bold text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item) => (
                    <tr
                      key={item.product}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 object-cover border border-gray-100 rounded-lg shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-lg shrink-0">
                              <BsImage className="text-gray-300 text-lg" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              to={`/product/${item.product}`}
                              className="font-trebuchet font-semibold text-gray-900 text-[14px] hover:text-blue-600 transition-colors line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            {item.variantInfo?.hasVariants && (
                              <p className="text-gray-400 text-[14px] font-trebuchet mt-0.5">
                                {item.variantInfo.colorName}
                                {item.variantInfo.sizeName ? ` / ${item.variantInfo.sizeName}` : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-[14px] font-trebuchet text-gray-600">
                        {item.qty ?? 0}
                      </td>
                      <td className="py-3 px-3 text-right text-[14px] font-trebuchet text-gray-600 whitespace-nowrap">
                        ৳{getItemPrice(item).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-[14px] font-trebuchet font-bold text-gray-900 whitespace-nowrap">
                        ৳{(getItemPrice(item) * (item.qty ?? 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Price Summary Table */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
              <h3 className="font-trebuchet font-black text-gray-900 text-[14px] uppercase tracking-wide mb-3 pb-3 border-b border-gray-100">
                Price Details
              </h3>
              <table className="w-full">
                <tbody>
                  <InfoRow label="Subtotal" value={`৳${(order.itemsPrice ?? 0).toFixed(2)}`} />
                  <InfoRow
                    label={`Coupon${order.appliedCuppon?.code ? ` (${order.appliedCuppon.code})` : ""}`}
                    value={`-৳${(order.appliedCuppon?.discountAmount ?? 0).toFixed(2)}`}
                    valueClass={order.appliedCuppon?.discountAmount > 0 ? "text-green-600" : ""}
                  />
                  <InfoRow
                    label="Shipping"
                    value={
                      (order.shippingPrice ?? 0) === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `৳${(order.shippingPrice ?? 0).toFixed(2)}`
                      )
                    }
                  />
                  <InfoRow label="Tax" value={`৳${(order.taxPrice ?? 0).toFixed(2)}`} />
                  <InfoRow
                    label="Total Savings"
                    value={`৳${(order.totalSavings ?? 0).toFixed(2)}`}
                    valueClass={(order.totalSavings ?? 0) > 0 ? "text-green-600" : ""}
                  />
                  <tr className="border-t border-gray-200">
                    <td className="pt-3 text-[14px] font-trebuchet font-black text-gray-900 uppercase">Total</td>
                    <td className="pt-3 text-[16px] font-trebuchet font-black text-gray-900 text-right">
                      ৳{(order.totalPrice ?? 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Order Info Table */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
              <h3 className="font-trebuchet font-black text-gray-900 text-[14px] uppercase tracking-wide mb-3 pb-3 border-b border-gray-100">
                Order Info
              </h3>
              <table className="w-full">
                <tbody>
                  <InfoRow label="Payment Method" value={order.paymentMethod || "N/A"} />
                  <InfoRow label="Payment Status" value={order.paymentStatus || "N/A"} />
                  <InfoRow label="Order Status" value={order.isDelivered || "N/A"} />
                  <InfoRow label="Paid At" value={formatDate(order.paidAt)} />
                  <InfoRow label="Delivered At" value={formatDate(order.deliveredAt)} />
                  <InfoRow label="Courier" value={order.courierName || "N/A"} />
                  <InfoRow label="Tracking ID" value={order.courierTrackingId || "N/A"} />
                </tbody>
              </table>
            </div>
          </div>

          {/* Shipping Address Table */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h3 className="font-trebuchet font-black text-gray-900 text-[14px] uppercase tracking-wide mb-3 pb-3 border-b border-gray-100">
              Shipping Address
            </h3>
            <table className="w-full">
              <tbody>
                <InfoRow label="Name" value={order.shippingAddress?.name || "N/A"} />
                <InfoRow label="Address" value={order.shippingAddress?.address || "N/A"} />
                <InfoRow
                  label="Thana / District"
                  value={`${order.shippingAddress?.thana || "N/A"}, ${order.shippingAddress?.district || "N/A"}`}
                />
                <InfoRow label="Postal Code" value={order.shippingAddress?.postalCode || "N/A"} />
                <InfoRow label="Phone" value={order.shippingAddress?.phoneNumber || "N/A"} />
              </tbody>
            </table>
          </div>

          {/* Return Action */}
          {isReturnable && !showReturnForm && (
            <button
              onClick={() => setShowReturnForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-600 rounded-2xl p-4 transition-colors text-[14px] font-trebuchet font-bold uppercase tracking-wide"
            >
              <FaRotateLeft /> Request Return
            </button>
          )}

          {/* Return Form Section */}
          {showReturnForm && (
            <div className="bg-white rounded-2xl border border-red-200 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h3 className="font-trebuchet font-black text-gray-900 text-[14px] uppercase tracking-wide flex items-center gap-2">
                  <FaRotateLeft className="text-red-500" /> Return Request Form
                </h3>
                <button
                  onClick={() => setShowReturnForm(false)}
                  className="text-gray-400 hover:text-black text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleReturnSubmit} className="space-y-6">
                {/* Item Selection */}
                <div>
                  <p className="text-[14px] font-trebuchet font-bold text-gray-500 uppercase mb-3">
                    Select items to return
                  </p>
                  <div className="space-y-2">
                    {order.orderItems.map((item) => (
                      <label
                        key={item.product}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                          selectedItems.includes(item.product)
                            ? "border-blue-500 bg-blue-50/50"
                            : "border-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.product)}
                          onChange={() => handleItemToggle(item.product)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        {item.image && (
                          <img src={item.image} className="w-10 h-10 object-cover rounded" alt="" />
                        )}
                        <div className="flex-1 text-[14px] font-trebuchet font-medium text-gray-800 truncate">
                          {item.name}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-[14px] font-trebuchet font-bold text-gray-500 uppercase mb-2">
                    Reason for Return *
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-[14px] font-trebuchet focus:border-black focus:ring-0 outline-none"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="Defective Item">Defective Item</option>
                    <option value="Wrong Item Delivered">Wrong Item Delivered</option>
                    <option value="Size/Fit Issue">Size / Fit Issue</option>
                    <option value="Color Mismatch">Color Mismatch</option>
                    <option value="Changed My Mind">Changed My Mind</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[14px] font-trebuchet font-bold text-gray-500 uppercase mb-2">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={returnDesc}
                    onChange={(e) => setReturnDesc(e.target.value)}
                    placeholder="Tell us more about the issue..."
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-[14px] font-trebuchet focus:border-black focus:ring-0 outline-none resize-none"
                  ></textarea>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-[14px] font-trebuchet font-bold text-gray-500 uppercase mb-2">
                    Upload Images (Proof) - Max 5
                  </label>

                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                      returnImages.length >= 5
                        ? "border-gray-100 bg-gray-50 cursor-not-allowed"
                        : "border-gray-300 hover:border-blue-500 hover:bg-blue-50/50"
                    }`}
                  >
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-[14px] text-gray-500 font-trebuchet font-medium">
                      {returnImages.length >= 5 ? "Limit Reached" : "Click to upload"}
                    </p>
                    <p className="text-[14px] text-gray-400 font-trebuchet mt-1">PNG, JPG up to 2MB</p>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={returnImages.length >= 5}
                    />
                  </label>

                  {returnImages.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {returnImages.map((img, index) => (
                        <div
                          key={index}
                          className="relative w-20 h-20 border border-gray-200 rounded-xl overflow-hidden group"
                        >
                          <img src={img} alt={`proof-${index}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-[14px] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReturnForm(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-trebuchet font-bold text-[14px] uppercase tracking-wide hover:border-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isReturning}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-trebuchet font-bold text-[14px] uppercase tracking-wide hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isReturning ? "Submitting..." : "Submit Return"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Back Button */}
          <div className="pt-2">
            <Link
              to="/user-orders"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-black font-trebuchet text-[14px] font-medium transition-colors"
            >
              <BsArrowLeft /> Back to Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;