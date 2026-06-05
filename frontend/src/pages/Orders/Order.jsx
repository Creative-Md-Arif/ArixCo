import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
} from "../../redux/api/orderApiSlice";
import { FaUser, FaCreditCard, FaTruckFast, FaFileInvoiceDollar } from "react-icons/fa6";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useEffect } from "react";
import { motion } from "framer-motion";
import InvoicePDF from "../../components/InvoicePDF";

const Order = () => {
  const { id: orderId } = useParams();
  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [deliverOrder] = useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    refetch();
  }, [orderId, refetch]);

  const itemsPrice = order?.itemsPrice || 0;
  const shippingCharge = order?.shippingPrice || 0;
  const totalPrice = order?.totalPrice || 0;

  const calculateFinalPrice = (item) => {
    const price = item.variantInfo?.variantPrice || item.price || 0;
    const discount =
      item.discountPercentage > 0
        ? (price * item.discountPercentage) / 100
        : 0;
    return (price - discount).toFixed(2);
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant="danger">{error.data.message}</Message>;

  return (
    <div className="bg-white min-h-screen pb-16">
      {/* ── Top bar with breadcrumb ── */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 font-mono text-[11px] sm:text-xs uppercase tracking-[0.18em] flex-wrap">
          <Link to="/" className="text-gray-400 hover:text-black transition-colors">
            Home
          </Link>
          <span className="text-gray-200">/</span>
          <Link to="/profile" className="text-gray-400 hover:text-black transition-colors">
            My Orders
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-black font-bold truncate max-w-[120px] sm:max-w-none">
            {order?.orderId || orderId}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 mt-[60px]">

        {/* ── Success Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center pb-10 sm:pb-14"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-green-50 border-2 border-green-200 rounded-full mb-5">
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-mono font-black text-gray-900 uppercase tracking-tighter leading-none">
            Order{" "}
            <span className="text-blue-600">Confirmed!</span>
          </h1>
          <p className="text-gray-400 font-mono text-xs sm:text-sm mt-3 max-w-xl mx-auto uppercase tracking-wide leading-relaxed px-2">
            Thank you for choosing AriX GeaR. Your order has been placed and is
            being processed.
          </p>

          {/* Order ID pill */}
          <div className="mt-5 inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 sm:px-6 py-2 rounded-full">
            <span className="text-gray-400 font-mono text-[11px] sm:text-xs font-bold uppercase">
              Order ID:
            </span>
            <span className="text-blue-600 font-mono font-black text-xs sm:text-sm">
              {order.orderId || order?._id}
            </span>
          </div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8">

          {/* ── LEFT: Products ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-[62%]"
          >
            {/* Card */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">

              {/* Card header */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                <h3 className="text-sm sm:text-base font-mono font-black uppercase tracking-tight text-gray-900">
                  Ordered Items
                </h3>
                <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold">
                  {order.orderItems.length} Products
                </span>
              </div>

              {/* Table — scrollable on small screens */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 sm:px-6 py-3 text-left text-[10px] sm:text-[11px] font-mono font-black text-gray-400 uppercase tracking-widest">
                        Product
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-center text-[10px] sm:text-[11px] font-mono font-black text-gray-400 uppercase tracking-widest w-16">
                        Qty
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-[10px] sm:text-[11px] font-mono font-black text-gray-400 uppercase tracking-widest">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors"
                      >
                        {/* Product cell */}
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <Link
                                to={`/product/${item.product}`}
                                className="text-xs sm:text-sm font-mono font-black text-gray-900 hover:text-blue-600 transition-colors uppercase leading-snug line-clamp-2"
                              >
                                {item.name}
                              </Link>

                              {item.variantInfo?.hasVariants && (
                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-gray-200 flex-shrink-0"
                                    style={{
                                      backgroundColor: item.variantInfo.colorHex,
                                    }}
                                  />
                                  <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                                    {item.variantInfo.colorName} /{" "}
                                    {item.variantInfo.sizeName}
                                  </span>
                                  {item.variantInfo.sku && (
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      SKU: {item.variantInfo.sku}
                                    </span>
                                  )}
                                </div>
                              )}

                              <p className="text-[10px] sm:text-[11px] text-gray-400 font-mono mt-1 uppercase">
                                Unit: ৳
                                {item.variantInfo?.variantPrice || item.price}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Qty cell */}
                        <td className="px-4 sm:px-6 py-4 text-center">
                          <span className="inline-block min-w-[28px] bg-gray-100 text-gray-700 font-mono font-black text-xs sm:text-sm px-2 py-0.5 rounded-lg border border-gray-200">
                            {item.qty}
                          </span>
                        </td>

                        {/* Total cell */}
                        <td className="px-4 sm:px-6 py-4 text-right font-mono font-black text-sm sm:text-base text-gray-900 whitespace-nowrap">
                          ৳
                          {(
                            item.qty * Number(calculateFinalPrice(item))
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="px-4 sm:px-6 py-5 bg-gray-50/70 border-t border-gray-100">
                <div className="space-y-2.5 max-w-[220px] sm:max-w-xs ml-auto">
                  <div className="flex justify-between text-xs sm:text-sm font-mono text-gray-400 font-bold uppercase">
                    <span>Subtotal</span>
                    <span className="text-gray-800 font-black">
                      ৳{Number(itemsPrice).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-mono text-gray-400 font-bold uppercase">
                    <span>Shipping</span>
                    <span className="text-gray-800 font-black">
                      {Number(shippingCharge) === 0
                        ? "FREE"
                        : `৳${Number(shippingCharge).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-sm sm:text-base font-mono font-black text-gray-900 uppercase">
                      Total
                    </span>
                    <span className="text-lg sm:text-2xl font-mono font-black text-blue-600">
                      ৳{Number(totalPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Info cards ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-[38%] space-y-5"
          >
            {/* Customer Info */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-white">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-500 border border-blue-100">
                  <FaUser size={16} />
                </div>
                <h3 className="text-sm sm:text-base font-mono font-black uppercase tracking-tight text-gray-900">
                  Customer Info
                </h3>
              </div>

              <div className="px-4 sm:px-6 py-5 space-y-4 font-mono bg-white">
                {/* Name */}
                <div className="pb-4 border-b border-gray-100">
                  <label className="text-[10px] sm:text-[11px] text-gray-400 font-black uppercase tracking-widest block mb-1">
                    Name
                  </label>
                  <p className="text-xs sm:text-sm font-bold text-gray-800 uppercase">
                    {order?.shippingAddress?.name}
                  </p>
                </div>
                {/* Contact */}
                <div className="pb-4 border-b border-gray-100">
                  <label className="text-[10px] sm:text-[11px] text-gray-400 font-black uppercase tracking-widest block mb-1">
                    Contact
                  </label>
                  <p className="text-xs sm:text-sm font-bold text-gray-800">
                    {order?.shippingAddress?.phoneNumber}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                    {order?.user?.email}
                  </p>
                </div>
                {/* Address */}
                <div>
                  <label className="text-[10px] sm:text-[11px] text-gray-400 font-black uppercase tracking-widest block mb-1">
                    Delivery Address
                  </label>
                  <p className="text-xs sm:text-sm font-bold text-gray-800 uppercase leading-relaxed">
                    {order?.shippingAddress?.address},{" "}
                    {order?.shippingAddress?.city} —{" "}
                    {order?.shippingAddress?.postalCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-white">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-500 border border-blue-100">
                  <FaCreditCard size={16} />
                </div>
                <h3 className="text-sm sm:text-base font-mono font-black uppercase tracking-tight text-gray-900">
                  Status
                </h3>
              </div>

              <div className="px-4 sm:px-6 py-5 space-y-3 bg-white font-mono">
                {/* Payment */}
                <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">
                    Payment
                  </span>
                  <span
                    className={`text-[11px] sm:text-xs font-black px-3 py-1 rounded-full uppercase border ${
                      order.paymentStatus === "paid"
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-orange-50 text-orange-600 border-orange-200"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                {/* Delivery */}
                <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">
                    Delivery
                  </span>
                  <span
                    className={`text-[11px] sm:text-xs font-black px-3 py-1 rounded-full uppercase border ${
                      order.isDelivered === "Delivered"
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}
                  >
                    {order.isDelivered}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin: Mark as Delivered */}
            {userInfo?.isAdmin && !order.isDelivered === "Delivered" && (
              <button
                onClick={() => deliverOrder(orderId)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-green-600 text-white py-3.5 rounded-xl font-mono font-black uppercase tracking-widest text-xs sm:text-sm transition-colors"
              >
                <FaTruckFast size={14} />
                Mark As Delivered
              </button>
            )}

            {/* Download Invoice */}
            <PDFDownloadLink
              document={<InvoicePDF order={order} />}
              fileName={`invoice_${order.orderId}.pdf`}
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-blue-600 text-white py-3.5 rounded-xl font-mono font-black uppercase tracking-widest text-xs sm:text-sm transition-colors"
            >
              {({ loading }) =>
                loading ? (
                  "Generating..."
                ) : (
                  <>
                    <FaFileInvoiceDollar size={14} />
                    Download Invoice
                  </>
                )
              }
            </PDFDownloadLink>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Order;