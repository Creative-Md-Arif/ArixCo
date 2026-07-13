import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navigation from "./pages/Auth/Navigation";
import Footer from "./components/Footer";
import { useNotifications } from "./hooks/useNotifications";
import { Helmet } from "react-helmet-async";
import Cart from "./pages/Cart";
import useBodyScrollLock from "./hooks/useBodyScrollLock";
import { useState } from "react";


const HIDDEN_PATHS = [
  "/admin/dashboard",
  "/admin/categorylist",
  "/admin/userlist",
  "/admin/productlist",
  "/admin/allproductslist",
  "/admin/orderlist",
  "/admin/bannerlist",
  "/admin/banner/create",
];

function App() {
  useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useBodyScrollLock(isMenuOpen);

  // Routes where Footer and FooterBanners should be hidden
  const shouldShowExtras =
    !HIDDEN_PATHS.includes(location.pathname) &&
    !location.pathname.startsWith("/admin/banner/update") &&
    !location.pathname.startsWith("/admin/product/update");

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="theme-color" content="#B88E2F" />
      </Helmet>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        pauseOnHover
        closeOnClick
        style={{ zIndex: 99999 }}
      />
      <ScrollRestoration />

      <div
        className={`relative flex flex-col overflow-x-hidden bg-white ${
          shouldShowExtras ? "min-h-screen" : "h-screen overflow-hidden"
        }`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] bg-[#B88E2F] text-white px-4 py-2 rounded text-sm font-bold transition-all duration-200"
        >
          Skip to main content
        </a>
        <Navigation isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <main
          id="main-content"
          className={`flex-grow ${!shouldShowExtras ? "overflow-y-auto" : ""}`}
          role="main"
          aria-label="Main content"
        >
          <Outlet />
        </main>
        {shouldShowExtras && (
          <>
            <Footer />
          </>
        )}
      </div>
      <Cart />
    </>
  );
}

export default App;
