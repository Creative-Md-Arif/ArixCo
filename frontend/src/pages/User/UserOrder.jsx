import Message from "../../components/Message";
import { Link, NavLink } from "react-router-dom";
import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";
import { BsEye, BsBagCheck, BsPersonCircle } from "react-icons/bs";

/* ── Custom Skeleton Loader ── */
const OrderSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-gray-100">
      <div className="h-6 w-36 bg-gray-100 rounded-lg animate-pulse mb-2" />
      <div className="h-3 w-52 bg-gray-50 rounded animate-pulse" />
    </div>
    <div className="divide-y divide-gray-50">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="px-4 sm:px-8 py-4 sm:py-5 flex items-center gap-3 sm:gap-6"
          style={{ opacity: 1 - i * 0.15 }}
        >
          <div className="h-4 w-20 sm:w-28 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-16 sm:w-24 bg-gray-50 rounded animate-pulse" />
          <div className="h-6 w-14 sm:w-20 bg-gray-100 rounded-full animate-pulse ml-auto sm:ml-0" />
          <div className="h-6 w-14 sm:w-20 bg-blue-50 rounded-full animate-pulse hidden sm:block" />
          <div className="h-4 w-16 sm:w-20 bg-gray-50 rounded animate-pulse hidden md:block" />
          <div className="h-8 w-20 sm:w-24 bg-gray-900/5 rounded-xl animate-pulse ml-auto" />
        </div>
      ))}
    </div>
  </div>
);

/* ── Empty State ── */
const EmptyOrders = () => (
  <div className="py-20 sm:py-28 text-center">
    <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 border border-gray-100 rounded-full mb-5">
      <svg
        className="w-7 h-7 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    </div>
    <p className="font-mono text-sm text-gray-400 uppercase tracking-widest">
      No orders found
    </p>
    <Link
      to="/"
      className="inline-block mt-5 bg-black text-white font-mono font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
    >
      Start Shopping
    </Link>
  </div>
);

const UserOrder = () => {
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  return (
    <div className="bg-white min-h-screen">
      {/* ✅ Unified Breadcrumb (Exactly same as Profile) */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-gray-400">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              to="/profile"
              className="hover:text-blue-600 transition-colors"
            >
              Profile
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-blue-600 font-black">Order History</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* ✅ Unified Tab Navigation (Exactly same as Profile) */}
        <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto pb-px">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono font-black uppercase tracking-widest transition-colors rounded-t-lg whitespace-nowrap ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <BsPersonCircle className="text-sm" /> Profile
          </NavLink>
          <NavLink
            to="/user-orders"
            className={({ isActive }) =>
              `flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono font-black uppercase tracking-widest transition-colors rounded-t-lg whitespace-nowrap ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <BsBagCheck className="text-sm" /> Orders
          </NavLink>
        </div>

        {/* ✅ Unified Container Width (max-w-5xl - Same as Profile) */}
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <OrderSkeleton />
          ) : error ? (
            <Message variant="danger">
              {error?.data?.error || error.error}
            </Message>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* ── Card Header ── */}
              <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-2xl font-mono font-black text-gray-900 uppercase tracking-tighter">
                    My <span className="text-blue-600">Orders</span>
                  </h2>
                  <p className="text-gray-400 text-[11px] sm:text-xs font-mono mt-1 uppercase tracking-wide">
                    Track and manage your recent purchases
                  </p>
                </div>
                <span className="self-start sm:self-auto bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold">
                  {orders.length} Orders
                </span>
              </div>

              {orders.length === 0 ? (
                <EmptyOrders />
              ) : (
                /* ── Table ── */
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[540px] border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-[11px] font-mono font-black text-gray-400 uppercase tracking-widest">
                          Order ID
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-[11px] font-mono font-black text-gray-400 uppercase tracking-widest">
                          Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-[11px] font-mono font-black text-gray-400 uppercase tracking-widest text-center">
                          Payment
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-[11px] font-mono font-black text-gray-400 uppercase tracking-widest text-center">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-[11px] font-mono font-black text-gray-400 uppercase tracking-widest text-right">
                          Amount
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-[11px] font-mono font-black text-gray-400 uppercase tracking-widest text-right">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* ✅ Removed framer-motion from table rows to prevent jumping/bumping */}
                      {orders.map((order) => (
                        <tr
                          key={order._id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-4">
                            <span className="text-[11px] sm:text-xs font-mono font-black text-blue-600">
                              #{order.orderId}
                            </span>
                          </td>

                          <td className="px-4 sm:px-6 py-4 text-[11px] sm:text-xs font-mono text-gray-500 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>

                          <td className="px-4 sm:px-6 py-4 text-center">
                            <span
                              className={`text-[10px] sm:text-[11px] font-mono font-black px-2.5 py-1 rounded-full uppercase border ${
                                order.paymentStatus === "paid"
                                  ? "bg-green-50 text-green-600 border-green-200"
                                  : "bg-red-50 text-red-500 border-red-200"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>

                          <td className="px-4 sm:px-6 py-4 text-center">
                            <span
                              className={`text-[10px] sm:text-[11px] font-mono font-black px-2.5 py-1 rounded-full uppercase border ${
                                order.isDelivered === "delivered"
                                  ? "bg-green-50 text-green-600 border-green-200"
                                  : "bg-blue-50 text-blue-600 border-blue-100"
                              }`}
                            >
                              {order.isDelivered}
                            </span>
                          </td>

                          <td className="px-4 sm:px-6 py-4 text-right font-mono font-black text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                            ৳{order.totalPrice.toFixed(2)}
                          </td>

                          <td className="px-4 sm:px-6 py-4 text-right">
                            <Link to={`/order/${order._id}`}>
                              <button className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-widest transition-colors">
                                <BsEye size={12} />
                                <span className="hidden sm:inline">
                                  Details
                                </span>
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrder;
