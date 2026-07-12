const isDevelopment = import.meta.env.DEV;


const BACKEND_URL =
  import.meta.env.VITE_API_URL || "https://arixco.onrender.com/";

export const BASE_URL = isDevelopment ? "" : BACKEND_URL;
export const API_URL = isDevelopment ? "" : BACKEND_URL;
export const USERS_URL = "/api/users";
export const CATEGORY_URL = "/api/category";
export const PRODUCT_URL = "/api/products";
export const UPLOAD_URL = "/api/upload";
export const DASHBOARD_URL = "/api/dashboard";
export const ORDERS_URL = "/api/orders";
export const CAMPAIGN_URL = "/api/campaigns";
export const NOTIFICATIONS_URL = "/api/notifications";
export const BANNER_URL = "/api/banners";
export const PAYMENTS_URL = "/api/payments";
export const CUPPON_URL = "/api/cuppons";
export const SHIPPING_URL = "/api/shipping";
export const TRACKING_URL = "/api/track";
export const RETURNS_URL = "/api/returns";
export const ORDER_PAY_URL = (orderId) => `/api/orders/${orderId}/pay`;
export const SOCKET_URL = isDevelopment ? "http://localhost:8000" : BACKEND_URL;
export const UPLOADS_URL = isDevelopment
  ? "http://localhost:8000/uploads"
  : `${BACKEND_URL}/uploads`;
