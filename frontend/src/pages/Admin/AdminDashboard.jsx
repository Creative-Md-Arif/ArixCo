
/* eslint-disable react/prop-types */
import Chart from "react-apexcharts";
import { useGetUsersQuery } from "@redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
  useGetTotalOrdersByDateQuery,
  useGetSalesSummaryByStatusQuery,
  useGetDeliverySummaryQuery,
} from "@redux/api/orderApiSlice";
import { useGetPaymentStatsQuery } from "@redux/api/paymentApiSlice";
import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import OrderList from "./OrderList";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { data: sales, isLoading } = useGetTotalSalesQuery();
  const { data: customers } = useGetUsersQuery();
  const { data: orders } = useGetTotalOrdersQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();
  const { data: ordersByDate } = useGetTotalOrdersByDateQuery();
  const { data: salesByDate } = useGetTotalSalesByDateQuery();
  const { data: statusSummary } = useGetSalesSummaryByStatusQuery();
  const { data: deliverySummary } = useGetDeliverySummaryQuery();
  const { data: paymentStats } = useGetPaymentStatsQuery();

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
  const todayOrders = ordersByDate?.find((item) => item._id === today)?.totalOrders || 0;
  const todaySales = salesByDate?.find((item) => item._id === today)?.totalSales || 0;

  const getStatusData = (status) => {
    const data = statusSummary?.find((item) => item._id === status);
    return { amount: data?.totalSales || 0, count: data?.orderCount || 0 };
  };

  const getDeliveryData = (status) => {
    const data = deliverySummary?.find((item) => item._id === status);
    return { count: data?.count || 0, amount: data?.totalAmount || 0 };
  };

  const getManualPaymentStats = () => {
    if (!paymentStats?.byMethod) return { total: 0, pending: 0, verified: 0, failed: 0, revenue: 0 };
    return {
      total: paymentStats.byMethod.reduce((acc, curr) => acc + curr.count, 0),
      pending: paymentStats.byMethod.reduce((acc, curr) => acc + curr.pending, 0),
      verified: paymentStats.byMethod.reduce((acc, curr) => acc + curr.verified, 0),
      failed: paymentStats.byMethod.reduce((acc, curr) => acc + curr.failed, 0),
      revenue: paymentStats.overall?.totalRevenue || 0,
    };
  };

  const manualStats = getManualPaymentStats();

  const [state, setState] = useState({
    options: {
      chart: { type: "area", toolbar: { show: false }, dropShadow: { enabled: true, top: 10, left: 0, blur: 4, color: "#000", opacity: 0.05 } },
      fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0, stops: [0, 90, 100] } },
      colors: ["#000000"], // Black theme for chart line
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      grid: { borderColor: "#f1f1f1", strokeDashArray: 4, xaxis: { lines: { show: true } } },
      xaxis: { categories: [], axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: "#9ca3af", fontWeight: 500, fontSize: "10px" } } },
      yaxis: { labels: { style: { colors: "#9ca3af", fontWeight: 500, fontSize: "10px" }, formatter: (value) => `৳${value}` } },
      markers: { size: 4, colors: ["#000"], strokeColors: "#fff", strokeWidth: 2, hover: { size: 6 } },
      tooltip: { theme: "light", x: { show: true } },
    },
    series: [{ name: "Revenue", data: [] }],
  });

  useEffect(() => {
    if (salesDetail) {
      const formattedSalesDate = salesDetail.map((item) => ({ x: item._id, y: item.totalSales }));
      setState((prevState) => ({
        ...prevState,
        options: { ...prevState.options, xaxis: { ...prevState.options.xaxis, categories: formattedSalesDate.map((item) => item.x) } },
        series: [{ name: "Revenue", data: formattedSalesDate.map((item) => item.y) }],
      }));
    }
  }, [salesDetail]);

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-mono transition-all duration-500">
      <div className="flex flex-col 2xl:flex-row">
        <AdminMenu />
        <div className="flex-1 pt-10 pb-16 px-4">
          <div className="max-w-[1500px] mx-auto">
            
            {/* Header */}
            <div className="mb-8 border-l-4 border-black pl-4 sm:pl-6 py-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tighter uppercase">
                Dashboard / <span className="text-red-600">Overview</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">
                System Analytics & Real-time Metrics
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-8">
              <StatCard title="Sales Today" value={todaySales} loading={!salesByDate} />
              <StatCard title="Total Earnings" value={sales?.totalSales} loading={isLoading} />
              <StatCard title="Customers" value={customers?.length} loading={!customers} isCount />
              <StatCard title="Orders (Today)" value={todayOrders} loading={!ordersByDate} isCount />
              <StatCard title="All Orders" value={orders?.totalOrders} loading={isLoading} isCount />
            </div>

            {/* Manual Payment Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div className="bg-white p-4 sm:p-5 border border-gray-200 rounded-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-4 bg-red-600 rounded-full"></div> Manual Payments
                  </h2>
                  <Link to="/admin/payment-settings">
                    <button className="text-[9px] font-bold text-gray-500 hover:text-black uppercase tracking-wider transition-colors">
                      Settings →
                    </button>
                  </Link>
                </div>
                <div className="space-y-2">
                  {paymentStats?.byMethod?.map((stat) => (
                    <div key={stat._id} className="flex items-center justify-between p-2.5 border border-gray-200 rounded-sm hover:border-black transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          stat._id === 'bKash' ? 'bg-pink-600' :
                          stat._id === 'Nagad' ? 'bg-orange-500' :
                          stat._id === 'Rocket' ? 'bg-purple-600' :
                          'bg-blue-600'
                        }`}></span>
                        <span className="font-bold text-[11px] sm:text-xs">{stat._id}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900 text-[11px] sm:text-xs">৳{Number(stat.totalAmount).toLocaleString()}</p>
                        <p className="text-[8px] text-gray-400">{stat.count} orders</p>
                      </div>
                    </div>
                  ))}
                  {!paymentStats?.byMethod?.length && (
                    <p className="text-center text-gray-400 text-[10px] py-4 uppercase">No data</p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-4 sm:p-5 border border-gray-200 rounded-sm">
                <h2 className="text-xs sm:text-sm font-bold text-black mb-4 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1 h-4 bg-amber-500 rounded-full"></div> Payment Verification
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 border border-amber-200 rounded-sm bg-amber-50/50">
                    <p className="text-lg sm:text-xl font-black text-amber-600">{manualStats.pending}</p>
                    <p className="text-[8px] sm:text-[9px] uppercase font-bold text-gray-500 mt-1">Awaiting</p>
                  </div>
                  <div className="text-center p-3 border border-emerald-200 rounded-sm bg-emerald-50/50">
                    <p className="text-lg sm:text-xl font-black text-emerald-600">{manualStats.verified}</p>
                    <p className="text-[8px] sm:text-[9px] uppercase font-bold text-gray-500 mt-1">Verified</p>
                  </div>
                  <div className="text-center p-3 border border-red-200 rounded-sm bg-red-50/50">
                    <p className="text-lg sm:text-xl font-black text-red-600">{manualStats.failed}</p>
                    <p className="text-[8px] sm:text-[9px] uppercase font-bold text-gray-500 mt-1">Failed</p>
                  </div>
                  <div className="text-center p-3 border border-gray-200 rounded-sm bg-gray-50/50">
                    <p className="text-lg sm:text-xl font-black text-black">৳{Number(manualStats.revenue).toLocaleString()}</p>
                    <p className="text-[8px] sm:text-[9px] uppercase font-bold text-gray-500 mt-1">Revenue</p>
                  </div>
                </div>
                <div className="mt-3 p-2.5 bg-gray-50 border border-gray-200 rounded-sm">
                  <p className="text-[8px] sm:text-[9px] text-gray-500 text-center uppercase tracking-wider">
                    Total {manualStats.total} manual transactions processed
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {/* Breakdowns Column */}
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                <div className="bg-white p-4 sm:p-5 border border-gray-200 rounded-sm">
                  <h2 className="text-xs sm:text-sm font-bold text-black mb-4 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-4 bg-black rounded-full"></div> Payment Summary
                  </h2>
                  <div className="space-y-2">
                    <StatusRow label="Paid" data={getStatusData("paid")} dotColor="bg-emerald-500" />
                    <StatusRow label="Due (COD)" data={getStatusData("due")} dotColor="bg-blue-500" />
                    <StatusRow label="Pending" data={getStatusData("pending")} dotColor="bg-amber-500" />
                    <StatusRow label="Failed" data={getStatusData("failed")} dotColor="bg-red-500" />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 border border-gray-200 rounded-sm">
                  <h2 className="text-xs sm:text-sm font-bold text-black mb-4 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-4 bg-gray-500 rounded-full"></div> Logistics
                  </h2>
                  <div className="space-y-2">
                    <DeliveryMiniCard label="Order Placed" data={getDeliveryData("Order Placed")} />
                    <DeliveryMiniCard label="Processing" data={getDeliveryData("Processing")} />
                    <DeliveryMiniCard label="Shipped" data={getDeliveryData("Shipped")} />
                    <DeliveryMiniCard label="Out for Delivery" data={getDeliveryData("Out for Delivery")} />
                    <DeliveryMiniCard label="Delivered" data={getDeliveryData("Delivered")} />
                    <DeliveryMiniCard label="Cancelled" data={getDeliveryData("Cancelled")} />
                  </div>
                </div>
              </div>

              {/* Area Chart Section */}
              <div className="lg:col-span-3 bg-white p-4 sm:p-6 border border-gray-200 rounded-sm h-fit">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">Revenue Flow</h2>
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase">
                    <span className="w-2 h-2 bg-black rounded-full"></span> Sales Trend
                  </span>
                </div>
                <Chart options={state.options} series={state.series} type="area" height={320} />
              </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">Recent Orders</h2>
                <Link to="/admin/orderlist">
                  <button className="px-4 py-1.5 bg-black text-white text-[9px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors rounded-sm">
                    View All
                  </button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                <OrderList showAdminMenu={false} className="p-0" isDashboard={true} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const StatCard = ({ title, value, loading, isCount }) => (
  <div className="border border-gray-200 p-4 rounded-sm bg-white hover:border-black transition-colors">
    <p className="font-bold text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-wider mb-2">{title}</p>
    <p className="font-black text-lg sm:text-xl text-black truncate">
      {loading ? "..." : isCount ? value : `৳${Number(value).toLocaleString()}`}
    </p>
  </div>
);

const StatusRow = ({ label, data, dotColor }) => (
  <div className="flex items-center justify-between p-2.5 border border-gray-200 rounded-sm hover:border-black transition-colors">
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
      <div>
        <p className="font-bold text-[10px] sm:text-[11px] text-black">{label}</p>
        <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">{data.count} Orders</p>
      </div>
    </div>
    <p className="font-bold text-[10px] sm:text-xs text-gray-800">৳{Number(data.amount).toLocaleString()}</p>
  </div>
);

const DeliveryMiniCard = ({ label, data }) => (
  <div className="p-2.5 border border-gray-200 rounded-sm hover:border-black transition-colors flex justify-between items-center">
    <div>
      <p className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-gray-500">{label}</p>
      <p className="text-sm sm:text-base font-black text-black leading-none mt-1">
        {data.count} <span className="text-[8px] sm:text-[9px] font-medium text-gray-400">Orders</span>
      </p>
    </div>
    <div className="text-right">
      <p className="font-bold text-[10px] sm:text-xs text-gray-800">
        ৳{Number(data.amount).toLocaleString()}
      </p>
    </div>
  </div>
);

export default AdminDashboard;