/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import {
  Route,
  RouterProvider,
  createRoutesFromElements,
  createBrowserRouter,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import React, { Suspense, lazy } from "react";
import Loader from "./components/Loader";
import AllNotifications from "./components/AllNotifications";
import { HelmetProvider } from "react-helmet-async";



// Lazy Loading Components
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PaymentSuccess = lazy(() => import("./pages/Orders/PaymentSuccess"));
const PaymentFail = lazy(() => import("./pages/Orders/PaymentFail"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const VerifyOtp = lazy(() => import("./components/VerifyOtp"));
const Profile = lazy(() => import("./pages/User/Profile"));
const PrivateRoute = lazy(() => import("./components/PrivateRoute"));
const AdminRoute = lazy(() => import("./pages/Admin/AdminRoute"));
const UserList = lazy(() => import("./pages/Admin/UserList"));
const CategoryList = lazy(() => import("./pages/Admin/CategoryList"));
const ProductList = lazy(() => import("./pages/Admin/ProductList"));
const ProductUpdate = lazy(() => import("./pages/Admin/ProductUpdate"));
const AllProducts = lazy(() => import("./pages/Admin/AllProducts"));
const Home = lazy(() => import("./pages/Home"));
const Favorites = lazy(() => import("./pages/Products/Favorites"));
const ProductDetails = lazy(() => import("./pages/Products/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Shop = lazy(() => import("./pages/Shop"));
const Shipping = lazy(() => import("./pages/Orders/Shipping"));
const PlaceOrder = lazy(() => import("./pages/Orders/PlaceOrder"));
const Order = lazy(() => import("./pages/Orders/Order"));
const UserOrder = lazy(() => import("./pages/User/UserOrder"));
const OrderList = lazy(() => import("./pages/Admin/OrderList"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const VerifyResetOtp = lazy(() => import("./pages/Auth/VerifyResetOtp"));
const PaymentInstruction = lazy(
  () => import("./pages/Orders/PaymentInstruction"),
);
const CupponManage = lazy(() => import("./pages/Admin/CupponManage"));
const ShippingManage = lazy(() => import("./pages/Admin/ShippingManage"));
const PaymentSettings = lazy(() => import("./pages/Admin/PaymentSettings"));

// 🆕 BANNER COMPONENTS
const BannerList = lazy(() => import("./pages/Admin/BannerList"));
const BannerCreate = lazy(() => import("./pages/Admin/BannerCreate"));
const BannerUpdate = lazy(() => import("./pages/Admin/BannerUpdate"));

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen px-4">
    <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
    <h2 className="text-2xl font-semibold text-gray-600 mb-4">
      Page Not Found
    </h2>
    <p className="text-gray-500 mb-8 text-center max-w-md">
      The page youre looking for doesnt exist or has been moved.
    </p>
    <a
      href="/"
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
    >
      Return to Home
    </a>
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route
        path="/login"
        element={
          <Suspense fallback={<Loader />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/register"
        element={
          <Suspense fallback={<Loader />}>
            <Register />
          </Suspense>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <Suspense fallback={<Loader />}>
            {" "}
            <VerifyOtp />{" "}
          </Suspense>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <Suspense fallback={<Loader />}>
            <ForgotPassword />
          </Suspense>
        }
      />

      <Route
        path="/verify-reset-otp"
        element={
          <Suspense fallback={<Loader />}>
            <VerifyResetOtp />
          </Suspense>
        }
      />

      <Route
        path="/reset-password"
        element={
          <Suspense fallback={<Loader />}>
            <ResetPassword />
          </Suspense>
        }
      />

      <Route
        path="/all-notifications"
        element={
          <Suspense fallback={<Loader />}>
            <AllNotifications />
          </Suspense>
        }
      />
      <Route
        index={true}
        path="/"
        element={
          <Suspense fallback={<Loader />}>
            <Home />
          </Suspense>
        }
      />
      <Route
        path="/favorite"
        element={
          <Suspense fallback={<Loader />}>
            <Favorites />
          </Suspense>
        }
      />
      <Route
        path="/product/:id"
        element={
          <Suspense fallback={<Loader />}>
            <ProductDetails />
          </Suspense>
        }
      />
      <Route
        path="/cart"
        element={
          <Suspense fallback={<Loader />}>
            <Cart />
          </Suspense>
        }
      />
      <Route
        path="/shop"
        element={
          <Suspense fallback={<Loader />}>
            <Shop />
          </Suspense>
        }
      />
      <Route
        path="/shop/:keyword" // 🆕 URL parameter সহ
        element={
          <Suspense fallback={<Loader />}>
            <Shop />
          </Suspense>
        }
      />
      <Route
        path="/user-orders"
        element={
          <Suspense fallback={<Loader />}>
            <UserOrder />
          </Suspense>
        }
      />
      <Route
        path="/about"
        element={
          <Suspense fallback={<Loader />}>
            <About />
          </Suspense>
        }
      />
      <Route
        path="/contact"
        element={
          <Suspense fallback={<Loader />}>
            <Contact />
          </Suspense>
        }
      />
      <Route
        path="/payment/success"
        element={
          <Suspense fallback={<Loader />}>
            <PaymentSuccess />
          </Suspense>
        }
      />
  
        <Route
        path="/payment/fail"
        element={
          <Suspense fallback={<Loader />}>
            <PaymentFail />
          </Suspense>
        }
      />
      <Route
        path="/payment/cancel"
        element={
          <Suspense fallback={<Loader />}>
            <PaymentFail />
          </Suspense>
        }
      />



      {/* Private Routes */}
      <Route
        path="/"
        element={
          <Suspense fallback={<Loader />}>
            <PrivateRoute />
          </Suspense>
        }
      >
        <Route
          path="/profile"
          element={
            <Suspense fallback={<Loader />}>
              <Profile />
            </Suspense>
          }
        />
        <Route
          path="/shipping"
          element={
            <Suspense fallback={<Loader />}>
              <Shipping />
            </Suspense>
          }
        />
        <Route
          path="/placeorder"
          element={
            <Suspense fallback={<Loader />}>
              <PlaceOrder />
            </Suspense>
          }
        />
        <Route
          path="/order/:id"
          element={
            <Suspense fallback={<Loader />}>
              <Order />
            </Suspense>
          }
        />
        <Route
          path="/payment/checkout"
          element={
            <Suspense fallback={<Loader />}>
              <PaymentInstruction />
            </Suspense>
          }
        />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<Loader />}>
            <AdminRoute />
          </Suspense>
        }
      >
        <Route
          path="userlist"
          element={
            <Suspense fallback={<Loader />}>
              <UserList />
            </Suspense>
          }
        />
        <Route
          path="categorylist"
          element={
            <Suspense fallback={<Loader />}>
              <CategoryList />
            </Suspense>
          }
        />
        <Route
          path="productlist"
          element={
            <Suspense fallback={<Loader />}>
              <ProductList />
            </Suspense>
          }
        />
        <Route
          path="allproductslist"
          element={
            <Suspense fallback={<Loader />}>
              <AllProducts />
            </Suspense>
          }
        />
        <Route
          path="orderlist"
          element={
            <Suspense fallback={<Loader />}>
              <OrderList />
            </Suspense>
          }
        />
        <Route
          path="product/update/:_id"
          element={
            <Suspense fallback={<Loader />}>
              <ProductUpdate />
            </Suspense>
          }
        />
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<Loader />}>
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route
          path="cuppon-manage"
          element={
            <Suspense fallback={<Loader />}>
              <CupponManage />
            </Suspense>
          }
        />

        <Route
          path="shipping-manage"
          element={
            <Suspense fallback={<Loader />}>
              <ShippingManage />
            </Suspense>
          }
        />

        <Route
          path="payment-settings"
          element={
            <Suspense fallback={<Loader />}>
              <PaymentSettings />
            </Suspense>
          }
        />

        {/* 🆕 BANNER ROUTES */}
        <Route
          path="bannerlist"
          element={
            <Suspense fallback={<Loader />}>
              <BannerList />
            </Suspense>
          }
        />
        <Route
          path="banner/create"
          element={
            <Suspense fallback={<Loader />}>
              <BannerCreate />
            </Suspense>
          }
        />
        <Route
          path="banner/update/:id"
          element={
            <Suspense fallback={<Loader />}>
              <BannerUpdate />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
  {
    /* ১. Future Flags: এই অংশটি আপনার কনসোলের সব Router ওয়ার্নিং বন্ধ করে দিবে */
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);

const preconnectDomains = [
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
  "https://arixgear.com",
];

preconnectDomains.forEach((domain) => {
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = domain;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
});

const preloadCriticalResources = () => {
  // Preload logo or critical images
  const criticalImages = ["/logo.png", "/hero-banner.jpg"];

  preloadCriticalResources();

  criticalImages.forEach((src) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  });
};

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </HelmetProvider>,
);
