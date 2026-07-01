const isDevelopment = import.meta.env.DEV;

// Read from .env (VITE_API_URL). Falls back to the Render URL if the env
// variable isn't set, so nothing breaks if someone forgets to configure .env.
const BACKEND_URL =
  import.meta.env.VITE_API_URL || "https://bechabikri-1.onrender.com";

export const BASE_URL = isDevelopment ? "" : BACKEND_URL;
export const API_URL = isDevelopment ? "" : BACKEND_URL;
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
export const SOCKET_URL = isDevelopment ? "http://localhost:8000" : BACKEND_URL;
export const UPLOADS_URL = isDevelopment
  ? "http://localhost:8000/uploads"
  : `${BACKEND_URL}/uploads`;
