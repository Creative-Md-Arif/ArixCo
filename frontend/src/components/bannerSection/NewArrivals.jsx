import { Link } from "react-router-dom";
import { useGetNewArrivalsQuery } from "../../redux/api/productApiSlice";
import Product from "../../pages/Products/Product";
import Message from "../Message";
import {
  FaLongArrowAltRight,
  FaStar,
  FaClock,
  FaShoppingBag,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

/*
  SECTION IDENTITY: New Arrivals
  BG: Pure White #FFFFFF
  PATTERN: Ultra-subtle geometric grid — modern, clean, editorial
  Feel: Clean editorial / fashion magazine optimized for white
*/
const BG = {
  backgroundColor: "#FFFFFF",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='none'/%3E%3Crect x='2' y='2' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.04' stroke-width='1'/%3E%3Crect x='32' y='32' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.04' stroke-width='1'/%3E%3Crect x='32' y='2' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.025' stroke-width='1'/%3E%3Crect x='2' y='32' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.025' stroke-width='1'/%3E%3C/svg%3E")`,
  backgroundSize: "60px 60px",
};

const ProductSkeleton = () => (
  <div
    className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full"
    aria-hidden="true"
  >
    <div className="aspect-square bg-gray-50 flex items-center justify-center animate-pulse">
      <FaShoppingBag className="text-gray-200 text-3xl" />
    </div>
    <div className="p-3 space-y-2 flex-1">
      <div className="w-14 h-2.5 bg-gray-200 rounded animate-pulse" />
      <div className="w-full h-3.5 bg-gray-200 rounded animate-pulse" />
      <div className="w-3/4 h-3.5 bg-gray-200 rounded animate-pulse" />
      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mt-2" />
    </div>
  </div>
);

const HeaderSkeleton = () => (
  <div className="flex flex-col items-center mb-8 gap-2.5">
    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
    <div className="w-40 h-7 bg-gray-200 rounded animate-pulse" />
    <div className="w-12 h-[2px] bg-gray-200 rounded animate-pulse" />
  </div>
);

const NewArrivals = () => {
  const { data: products, isLoading, isError } = useGetNewArrivalsQuery(10);
  const [bdTime, setBdTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
      );
      setBdTime(
        now.toLocaleString("en-US", {
          timeZone: "Asia/Dhaka",
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <section
        className="py-12 sm:py-16 font-figtree"
        style={BG}
        aria-busy="true"
        aria-live="polite"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeaderSkeleton />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-10 sm:py-14 font-figtree"
      style={BG}
      aria-labelledby="new-arrivals-heading"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center mb-8 sm:mb-10 text-center gap-2"
        >
          <div className="flex items-center gap-1.5">
            <FaStar
              className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] text-[#B88E2F]"
              aria-hidden="true"
            />
            <span className="text-[10px] sm:text-[11px] font-black text-[#B88E2F] uppercase tracking-[0.3em]">
              Latest Collections
            </span>
            <FaStar
              className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] text-[#B88E2F]"
              aria-hidden="true"
            />
          </div>
          <h2
            id="new-arrivals-heading"
            className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-[0.1em] leading-tight"
          >
            New <span className="text-[#B88E2F]">Arrivals</span>
          </h2>
          <p className="text-[10px] sm:text-[11px] text-gray-600 max-w-xs sm:max-w-sm leading-relaxed">
            Discover our newest products and latest trends — freshest styles
            just added.
          </p>
          {bdTime && (
            <div className="flex items-center gap-1.5 border border-gray-200 bg-gray-50/80 px-3 py-1.5 rounded-md">
              <FaClock
                className="w-[10px] h-[10px] shrink-0 text-[#B88E2F] opacity-70"
                aria-hidden="true"
              />
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 tracking-wide">
                Last Updated: {bdTime} (BD Time)
              </span>
            </div>
          )}
          <div
            className="h-[2px] w-12 bg-[#B88E2F] rounded-full"
            aria-hidden="true"
          />
        </motion.header>

        {isError ? (
          <Message variant="danger">
            {isError?.data?.message ||
              "Failed to load new arrivals. Please try again."}
          </Message>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-5">
              {products?.slice(0, 10).map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <Product product={product} />
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center mt-10">
              <Link
                to="/shop?sort=newest"
                title="Browse all our new arrival products"
                aria-label="View all new arrivals"
                className="group inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-md text-[11px] font-black uppercase tracking-widest text-gray-800 hover:border-[#B88E2F] hover:text-[#B88E2F] transition-colors duration-200 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88E2F]/30"
              >
                View All New Arrivals
                <FaLongArrowAltRight
                  className="w-[12px] h-[12px] shrink-0 group-hover:translate-x-1 transition-transform duration-200"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;