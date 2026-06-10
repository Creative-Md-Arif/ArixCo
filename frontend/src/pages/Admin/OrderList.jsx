/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Message from "../../components/Message";
import AdminMenu from "./AdminMenu";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  usePayOrderMutation,
} from "@redux/api/orderApiSlice";
import { useVerifyManualPaymentMutation } from "../../redux/api/paymentApiSlice";
// Change FaTimes to FaXmark
import { FaEye, FaCheck, FaXmark, FaMagnifyingGlass, FaBox } from "react-icons/fa6";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast } from "react-toastify";

// Custom Loading Spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center gap-1.5 py-20">
    <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce"></div>
  </div>
);

const OrderList = ({
  showAdminMenu = true,
  className = "pt-10 pb-16",
  isDashboard = false,
}) => {
  const { data: orders, isLoading, error, refetch } = useGetOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [payOrder] = usePayOrderMutation();
  const [verifyManualPayment] = useVerifyManualPaymentMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [verifyingOrder, setVerifyingOrder] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState("");

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus({ orderId, status: newStatus }).unwrap();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Status update failed");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    try {
      await payOrder({ orderId, status }).unwrap();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Payment update failed");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleVerifyPayment = async (status) => {
    if (!verifyingOrder) return;
    try {
      await verifyManualPayment({
        orderId: verifyingOrder._id,
        status,
        notes: verificationNotes,
      }).unwrap();
      toast.success(
        `Payment ${status === "paid" ? "approved" : "rejected"} successfully`,
      );
      setVerifyingOrder(null);
      setVerificationNotes("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Verification failed");
    }
  };

  const sortedOrders = orders
    ? [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  const filteredOrders = sortedOrders.filter((order) => {
    const matchesSearchTerm =
      (order.user?.username?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (order.orderId || "").toLowerCase().includes(searchTerm.toLowerCase());
    const orderDate = new Date(order.createdAt);
    const matchesStartDate = startDate
      ? orderDate >= new Date(startDate)
      : true;
    const matchesEndDate = endDate ? orderDate <= new Date(endDate) : true;
    return matchesSearchTerm && matchesStartDate && matchesEndDate;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = isDashboard
    ? sortedOrders.slice(0, 5)
    : filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const needsVerification = (order) =>
    order.paymentStatus === "awaiting_verification" &&
    ["bKash", "Nagad", "Rocket", "Bank"].includes(order.paymentMethod);

  // Reusable Styles
  const inputClass =
    "w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const selectClass =
    "w-full border border-gray-200 rounded-sm px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-black outline-none cursor-pointer bg-white";

  return (
    <div className={`w-full h-fit bg-[#fdfdfd] font-mono ${className}`}>
      <div className="container mx-auto px-4 sm:px-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header & Admin Menu */}
            {showAdminMenu && (
              <div className="flex flex-col 2xl:flex-row mb-8 border-b border-gray-200 pb-4">
                <AdminMenu />
              </div>
            )}

            {!isDashboard && (
              <div className="mb-8 border-l-4 border-black pl-4 sm:pl-6 py-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tighter uppercase">
                  Order / <span className="text-red-600">Management</span>
                </h1>
                <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">
                  Total Logs: {filteredOrders.length}
                </p>
              </div>
            )}

            {/* Filter Terminal */}
            {!isDashboard && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 border border-gray-200 rounded-sm bg-white">
                <div className="relative sm:col-span-2 md:col-span-1">
                  <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
                  <input
                    type="text"
                    placeholder="SEARCH ID / USER..."
                    className={`${inputClass} pl-9 uppercase text-xs`}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <input
                  type="date"
                  className={`${inputClass} text-xs`}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className={`${inputClass} text-xs`}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="bg-black text-white text-[10px] font-bold tracking-widest hover:bg-red-600 transition-all uppercase py-2 rounded-sm"
                >
                  Reset
                </button>
              </div>
            )}

            {/* ============================================ */}
            {/* MOBILE VIEW: Card Layout (Visible < md) */}
            {/* ============================================ */}
            <div className="md:hidden space-y-4">
              {currentOrders.map((order) => (
                <div
                  key={order._id}
                  className="border border-gray-200 p-4 rounded-sm bg-white hover:border-black transition-colors"
                >
                  <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-black uppercase tracking-tight">
                        #{order.orderId}
                      </h3>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                        {order.user?.username || "N/A"}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">
                      {order.createdAt?.substring(0, 10)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    {order.orderItems[0]?.image && (
                      <img
                        src={order.orderItems[0].image}
                        className="w-14 h-14 object-cover border border-gray-200 rounded-sm p-0.5"
                        alt=""
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-500 uppercase block">
                          Total
                        </span>
                        <span className="text-base font-black text-black">
                          ৳{order.totalPrice}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase block">
                          Delivery
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-sm ${order.isDelivered === "Delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {order.isDelivered || "Placed"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] font-bold text-gray-400 uppercase block mb-1">
                          Payment
                        </label>
                        <select
                          value={
                            order.paymentStatus ||
                            (order.isPaid ? "paid" : "due")
                          }
                          onChange={(e) =>
                            handlePaymentStatusChange(order._id, e.target.value)
                          }
                          disabled={updatingOrderId === order._id}
                          className={selectClass}
                        >
                          <option value="paid">PAID</option>
                          <option value="due">DUE</option>
                          <option value="pending">PENDING</option>
                          <option value="failed">FAILED</option>
                          <option value="awaiting_verification">
                            AWAITING
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-gray-400 uppercase block mb-1">
                          Status
                        </label>
                        <select
                          value={order.isDelivered || "Order Placed"}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          disabled={updatingOrderId === order._id}
                          className={`${selectClass} ${order.isDelivered === "Delivered" ? "text-green-700" : "text-yellow-700"}`}
                        >
                          <option value="Order Placed">Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">
                            Out for Delivery
                          </option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-2">
                      {needsVerification(order) ? (
                        <button
                          onClick={() => setVerifyingOrder(order)}
                          className="w-full bg-amber-500 text-white px-4 py-2 text-[10px] tracking-widest hover:bg-amber-600 transition-all uppercase font-bold rounded-sm flex items-center justify-center gap-2"
                        >
                          <FaEye /> Verify Payment
                        </button>
                      ) : (
                        <Link
                          to={`/order/${order._id}`}
                          className="block w-full text-center bg-black text-white px-4 py-2 text-[10px] tracking-widest hover:bg-red-600 transition-all uppercase font-bold rounded-sm"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ============================================ */}
            {/* DESKTOP VIEW: Table Layout (Visible >= md) */}
            {/* ============================================ */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-sm">
              {!isDashboard && (
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                    <FaBox size={10} /> Rows:
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white border border-gray-200 rounded-sm text-[10px] font-bold p-1 outline-none cursor-pointer"
                    >
                      {[8, 16, 24, 36].map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 uppercase tracking-widest">
                  <tr>
                    {[
                      "Items",
                      "ID",
                      "User",
                      "Date",
                      "Total",
                      "Pay Method",
                      "Pay Status",
                      "Delivery",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-4 text-[10px] font-bold text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <img
                          src={order.orderItems[0]?.image}
                          className="w-10 h-10 object-cover border border-gray-200 rounded-sm p-0.5"
                          alt=""
                        />
                      </td>
                      <td className="px-4 py-3 font-bold text-black">
                        {order.orderId}
                      </td>
                      <td className="px-4 py-3 uppercase text-gray-600 font-medium">
                        {order.user?.username || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {order.createdAt?.substring(0, 10)}
                      </td>
                      <td className="px-4 py-3 font-black text-black">
                        ৳{order.totalPrice}
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={
                            order.paymentStatus ||
                            (order.isPaid ? "paid" : "due")
                          }
                          onChange={(e) =>
                            handlePaymentStatusChange(order._id, e.target.value)
                          }
                          disabled={updatingOrderId === order._id}
                          className={selectClass}
                        >
                          <option value="paid">PAID</option>
                          <option value="due">DUE</option>
                          <option value="pending">PENDING</option>
                          <option value="failed">FAILED</option>
                          <option value="awaiting_verification">
                            AWAITING
                          </option>
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-sm text-[9px] font-bold uppercase ${
                            order.paymentStatus === "paid" || order.isPaid
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.paymentStatus?.toUpperCase() ||
                            (order.isPaid ? "PAID" : "DUE")}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={order.isDelivered || "Order Placed"}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          disabled={updatingOrderId === order._id}
                          className={`${selectClass} ${order.isDelivered === "Delivered" ? "text-green-700" : "text-yellow-700"}`}
                        >
                          <option value="Order Placed">Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">
                            Out for Delivery
                          </option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="px-4 py-3 text-right">
                        {needsVerification(order) ? (
                          <button
                            onClick={() => setVerifyingOrder(order)}
                            className="bg-amber-500 text-white px-4 py-1.5 text-[9px] tracking-widest hover:bg-amber-600 transition-all uppercase font-bold rounded-sm inline-flex items-center gap-1.5"
                          >
                            <FaEye size={10} /> Verify
                          </button>
                        ) : (
                          <Link
                            to={`/order/${order._id}`}
                            className="inline-block bg-black text-white px-4 py-1.5 text-[9px] tracking-widest hover:bg-red-600 transition-all uppercase font-bold rounded-sm"
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Terminal */}
            {!isDashboard && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
                <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Showing{" "}
                  <span className="text-black font-black">
                    {indexOfFirstItem + 1}-
                    {Math.min(indexOfLastItem, filteredOrders.length)}
                  </span>{" "}
                  of{" "}
                  <span className="text-red-600 font-black">
                    {filteredOrders.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-2 border border-gray-200 text-black hover:border-black disabled:opacity-20 disabled:hover:border-gray-200 disabled:cursor-not-allowed transition-all rounded-sm"
                  >
                    <FaChevronLeft size={12} />
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 text-[11px] font-bold transition-all rounded-sm ${currentPage === i + 1 ? "bg-black text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-2 border border-gray-200 text-black hover:border-black disabled:opacity-20 disabled:hover:border-gray-200 disabled:cursor-not-allowed transition-all rounded-sm"
                  >
                    <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {verifyingOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-sm p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200"
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-black uppercase tracking-tighter text-black">
                  Verify <span className="text-red-600">Payment</span>
                </h3>
                <button
                  onClick={() => setVerifyingOrder(null)}
                  className="p-2 text-gray-400 hover:text-black transition-colors"
                >
                  <FaXmark />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-gray-50 p-3 border border-gray-200 rounded-sm">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">
                    Order ID
                  </p>
                  <p className="font-black text-sm">{verifyingOrder.orderId}</p>
                </div>
                <div className="bg-gray-50 p-3 border border-gray-200 rounded-sm">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">
                    Payment Method
                  </p>
                  <p className="font-black text-sm">
                    {verifyingOrder.paymentMethod}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 border border-blue-200 rounded-sm">
                  <p className="text-[8px] text-blue-600 uppercase font-bold mb-0.5">
                    Transaction ID
                  </p>
                  <p className="font-black text-base tracking-wider text-blue-900">
                    {verifyingOrder.manualPaymentDetails?.transactionId ||
                      "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 border border-gray-200 rounded-sm">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">
                    Sent From
                  </p>
                  <p className="font-black text-sm">
                    {verifyingOrder.manualPaymentDetails?.senderNumber || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 border border-gray-200 rounded-sm">
                  <p className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">
                    Amount
                  </p>
                  <p className="font-black text-base text-red-600">
                    ৳{verifyingOrder.totalPrice}
                  </p>
                </div>

                {verifyingOrder.manualPaymentDetails?.paymentScreenshot && (
                  <div className="bg-gray-50 p-3 border border-gray-200 rounded-sm">
                    <p className="text-[8px] text-gray-500 uppercase font-bold mb-2">
                      Screenshot
                    </p>
                    <img
                      src={
                        verifyingOrder.manualPaymentDetails.paymentScreenshot
                      }
                      alt="Payment Proof"
                      className="w-full max-h-48 object-contain border border-gray-200 rounded-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-bold uppercase text-gray-500 mb-1">
                    Verification Notes (Optional)
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes..."
                    className={`${inputClass} resize-none`}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleVerifyPayment("paid")}
                  className="flex-1 py-3 bg-black text-white rounded-sm font-black uppercase tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <FaCheck /> Approve
                </button>
                <button
                  onClick={() => handleVerifyPayment("failed")}
                  className="flex-1 py-3 bg-white border border-red-600 text-red-600 rounded-sm font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <FaXmark /> Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderList;
