import { apiSlice } from "./apiSlice";
import { ORDERS_URL, ORDER_PAY_URL } from "../constants";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: "POST",
        body: order,
      }),
    }),

    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    payOrder: builder.mutation({
      query: ({ orderId, details, status }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: "PUT",
        body: { details, status },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Order", id: orderId },
        "Order", // লিস্ট রিফ্রেশ করার জন্য
      ],
    }),

    getPaypalClientId: builder.query({
      query: () => ({
        url: ORDER_PAY_URL,
      }),
    }),

    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
    }),

    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      providesTags: ["Order"],
    }),

    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: "Order", id: orderId },
        "Order",
      ],
    }),

    getTotalOrders: builder.query({
      query: () => `${ORDERS_URL}/total-orders`,
    }),

    getTotalSales: builder.query({
      query: () => `${ORDERS_URL}/total-sales`,
    }),

    getTotalSalesByDate: builder.query({
      query: () => `${ORDERS_URL}/total-sales-by-date`,
    }),

    getTotalOrdersByDate: builder.query({
      query: () => `${ORDERS_URL}/total-orders-by-date`,
    }),

    getSalesSummaryByStatus: builder.query({
      query: () => `${ORDERS_URL}/sales-summary`,
      keepUnusedDataFor: 5,
    }),

    getDeliverySummary: builder.query({
      query: () => `${ORDERS_URL}/delivery-summary`,
      keepUnusedDataFor: 5,
    }),

    // endpoints: (builder) => ({ ... }) এর ভিতরে এটি যোগ করুন
    getOrderTrackingHistory: builder.query({
      query: (orderId) => `/api/track/${orderId}`, // আপনার ব্যাকএন্ডের ট্র্যাকিং রাউট
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ orderId, status, courierName, courierTrackingId }) => ({
        // ✅ নতুন প্যারামিটার যোগ করা হলো
        url: `${ORDERS_URL}/${orderId}/status`,
        method: "PUT",
        body: { status, courierName, courierTrackingId },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Order", id: orderId },
        "Order",
      ],
    }),
  }),
});

export const {
  useGetTotalOrdersQuery,
  useGetTotalSalesQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalOrdersByDateQuery,
  useGetSalesSummaryByStatusQuery,
  useGetDeliverySummaryQuery,
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useGetMyOrdersQuery,
  useDeliverOrderMutation,
  useGetOrdersQuery,
  useGetOrderTrackingHistoryQuery,
  useUpdateOrderStatusMutation,
} = orderApiSlice;
