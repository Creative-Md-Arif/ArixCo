/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useGetBestSellersQuery } from "../../redux/api/productApiSlice";
import Product from "../../pages/Products/Product";
import Message from "../Message";
import { FaLongArrowAltRight, FaClock, FaTshirt, } from "react-icons/fa";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

/*
  SECTION IDENTITY: Best Sellers
  BG: Pure White #FFFFFF
  PATTERN: Ultra-subtle geometric grid — premium, clean structure
  Contrast: White cards with neutral borders pop cleanly against the white base
*/
const BG = {
  backgroundColor: "#FFFFFF",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='none'/%3E%3Crect x='2' y='2' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.04' stroke-width='1'/%3E%3Crect x='32' y='32' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.04' stroke-width='1'/%3E%3Crect x='32' y='2' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.025' stroke-width='1'/%3E%3Crect x='2' y='32' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.025' stroke-width='1'/%3E%3C/svg%3E")`,
  backgroundSize: "60px 60px",
};

const ProductSkeleton = ({ rank }) => (
  <div className="relative bg-white rounded-lg overflow-hidden border border-gray-200 h-full flex flex-col" aria-hidden="true">
    {rank <= 2 && (
      <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
        rank === 0 ? "bg-yellow-50" : rank === 1 ? "bg-gray-100" : "bg-orange-50"}`}>
        <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
      </div>
    )}
    <div className="relative aspect-square bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center">
        <FaTshirt className="text-gray-200 text-4xl" />
      </div>
    </div>
    <div className="p-3 flex flex-col flex-grow space-y-2">
      <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
      <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
      <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="flex items-center gap-2 mt-auto pt-2">
        <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

const HeaderSkeleton = () => (
  <div className="flex flex-col items-center mb-8 gap-2.5">
    <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
    <div className="w-48 h-8 bg-gray-200 rounded animate-pulse" />
    <div className="w-12 h-[2px] bg-gray-200 rounded animate-pulse" />
    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-md border border-gray-200">
      <FaClock className="text-gray-300" />
      <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

const BestSellers = () => {
  const { data: products, isLoading, isError } = useGetBestSellersQuery(10);
  const [bdTime, setBdTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
      setBdTime(now.toLocaleString("en-US", {
        timeZone: "Asia/Dhaka", weekday: "short", month: "short",
        day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 font-figtree" style={BG}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeaderSkeleton />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-5">
            {[0,1,2,3,4,5,6,7,8,9].map((i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ProductSkeleton rank={i} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-14 font-figtree" style={BG} aria-labelledby="bestsellers-heading">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.3 }}
          className="flex flex-col items-center mb-8 sm:mb-10 text-center gap-2"
        >
          <span className="text-[10px] sm:text-[11px] font-black text-[#B88E2F] uppercase tracking-[0.3em]">Trending</span>
          <h2 id="bestsellers-heading" className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-[0.1em] leading-tight">
            Best <span className="text-[#B88E2F]">Sellers</span>
          </h2>
          <div className="h-[2px] w-12 bg-[#B88E2F] rounded-full" />
          <div className="flex items-center gap-1.5 mt-1 px-3 py-1.5 border border-gray-200 rounded-md bg-gray-50/80">
            <FaClock className="w-[10px] h-[10px] text-[#B88E2F] opacity-70 shrink-0" aria-hidden="true" />
            <span className="text-[9px] sm:text-[10px] text-gray-600 font-bold tracking-wide">{bdTime} (BD Time)</span>
          </div>
        </motion.div>

        {isError ? (
          <Message variant="danger">{isError?.data?.message || isError.error}</Message>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-5">
              {products?.slice(0, 10).map((product, index) => (
                <motion.div key={product._id}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: index * 0.05, duration: 0.25 }}>
                  <Product product={product} />
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center mt-10">
              <Link to="/shop?sort=bestselling"
                className="group inline-flex items-center gap-2 px-6 py-2.5 text-[11px] font-black text-gray-800 uppercase tracking-widest border border-gray-300 rounded-md hover:border-[#B88E2F] hover:text-[#B88E2F] transition-colors duration-200 bg-white"
                aria-label="View all best selling products">
                View All Best Sellers
                <FaLongArrowAltRight className="w-[13px] h-[13px] shrink-0 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default BestSellers;