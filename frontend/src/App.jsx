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

function App() {
  useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useBodyScrollLock(isMenuOpen);

  // ✅ যদি রুটটি /admin দিয়ে শুরু হয়, তবে Navigation এবং Footer লুকাবে
  const isAdminRoute = location.pathname.startsWith("/admin");

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

      {/* Sticky Footer Wrapper */}
      <div
        className={`relative flex flex-col overflow-x-hidden bg-white min-h-screen ${
          isAdminRoute ? "h-screen overflow-hidden" : ""
        }`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] bg-[#B88E2F] text-white px-4 py-2 rounded text-sm font-bold transition-all duration-200"
        >
          Skip to main content
        </a>

        {/* ✅ শুধুমাত্র নন-অ্যাডমিন পেজের জন্য Navigation দেখাবে */}
        {!isAdminRoute && (
          <Navigation isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        )}

        <main
          id="main-content"
          className={`flex-grow flex flex-col ${
            isAdminRoute ? "h-full overflow-y-auto" : "min-h-[80vh]"
          }`}
          role="main"
          aria-label="Main content"
        >
          <Outlet />
        </main>

        {/* ✅ শুধুমাত্র নন-অ্যাডমিন পেজের জন্য Footer দেখাবে */}
        {!isAdminRoute && <Footer />}
      </div>

      <Cart />
    </>
  );
}

export default App;
