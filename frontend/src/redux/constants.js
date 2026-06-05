const isDevelopment = import.meta.env.DEV;
const RENDER_BACKEND_URL = "https://bechabikri-1.onrender.com";

export const BASE_URL = isDevelopment ? "" : RENDER_BACKEND_URL;
export const API_URL = isDevelopment ? "" : RENDER_BACKEND_URL;

export const USERS_URL = "/api/users";
export const CATEGORY_URL = "/api/category";
export const PRODUCT_URL = "/api/products";
export const UPLOAD_URL = "/api/upload";
export const ORDERS_URL = "/api/orders";
export const NOTIFICATIONS_URL = "/api/notifications";
export const BANNER_URL = "/api/banners";
export const PAYMENTS_URL = "/api/payments";
export const CUPPON_URL = "/api/cuppons";
export const SHIPPING_URL = "/api/shipping";
export const ORDER_PAY_URL = (orderId) => `/api/orders/${orderId}/pay`;

export const SOCKET_URL = isDevelopment
  ? "http://localhost:8000"
  : RENDER_BACKEND_URL;

export const UPLOADS_URL = isDevelopment
  ? "http://localhost:8000/uploads"
  : `${RENDER_BACKEND_URL}/uploads`;
