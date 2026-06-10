/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGetProductsQuery } from "../../redux/api/productApiSlice";

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef(null);

  // focus input when overlay opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setDebouncedQuery("");
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, open]);

  // ✅ জাম্পিং ফিক্স: lock body scroll & add padding for scrollbar
  useEffect(() => {
    const headerEl = document.getElementById("main-header-nav");

    if (open) {
      // স্ক্রলবার হাইড হওয়ার আগে এর উইডথ বের করা
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`; // বডি জাম্প ফিক্স

      // নেভিগেশনবার জাম্প ফিক্স (আগের স্টেপে আমরা হেডারে id="main-header-nav" দিয়েছিলাম)
      if (headerEl) headerEl.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      if (headerEl) headerEl.style.paddingRight = "0px";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      if (headerEl) headerEl.style.paddingRight = "0px";
    };
  }, [open]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useGetProductsQuery(
    { keyword: debouncedQuery, page: 1 },
    { skip: debouncedQuery.length < 2 },
  );

  const results = data?.products ?? [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          // নাভবারের ঠিক নিচ থেকে শুরু হবে (নাভবারের হাইট + গোল্ডেন লাইন)
          className="fixed inset-x-0 bottom-0 top-[53px] sm:top-[59px] md:top-[63px] lg:top-[67px] z-[1000] bg-[#1A1A1A] border-t border-white/10 flex flex-col"
        >
          {/* Search Input Area */}
          <div className="w-full border-b border-white/10 px-4 sm:px-6 md:px-8 py-4 bg-[#1A1A1A]">
            <div className="max-w-3xl mx-auto flex items-center gap-3 sm:gap-4 bg-[#252525] rounded-xl px-4 py-3 border border-white/10 focus-within:border-[#D4A843] transition-colors shadow-lg">
              <IoSearchOutline className="w-5 h-5 text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="flex-1 text-sm sm:text-base font-medium text-white bg-transparent outline-none placeholder:text-gray-600"
              />
              {query.length > 0 && (
                <button
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <IoCloseOutline className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Close search"
                className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-[#D4A843] border-l border-white/10 pl-3 ml-2 transition-colors"
              >
                ESC
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-3xl mx-auto w-full">
            {/* Loading */}
            {isFetching && (
              <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-[#D4A843] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-[#D4A843] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-[#D4A843] rounded-full animate-bounce [animation-delay:300ms]" />
                <span className="ml-2">Searching...</span>
              </div>
            )}

            {/* Results */}
            {!isFetching &&
              debouncedQuery.length >= 2 &&
              results.length > 0 && (
                <>
                  <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-500 mb-5 sm:mb-6">
                    {results.length} result{results.length > 1 ? "s" : ""} for
                    &quot;
                    <span className="text-[#D4A843]">{debouncedQuery}</span>
                    &quot;
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {results.map((product) => (
                      <Link
                        key={product._id}
                        to={`/product/${product.slug || product._id}`}
                        onClick={onClose}
                        className="group flex flex-col gap-2 sm:gap-3"
                      >
                        <div className="aspect-square bg-[#252525] rounded-lg overflow-hidden border border-white/5 group-hover:border-[#D4A843]/30 transition-colors">
                          <img
                            src={product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] sm:text-[12px] font-semibold text-gray-300 line-clamp-2 leading-snug group-hover:text-[#D4A843] transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[11px] sm:text-[12px] font-bold text-[#D4A843] mt-0.5 sm:mt-1">
                            ৳{product.price?.toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

            {/* No Results */}
            {!isFetching &&
              debouncedQuery.length >= 2 &&
              results.length === 0 && (
                <div className="flex flex-col items-center justify-center pt-16 gap-3">
                  <IoSearchOutline className="w-10 h-10 text-gray-700" />
                  <p className="text-[12px] text-gray-500">
                    No results found for &quot;
                    <span className="text-[#D4A843]">{debouncedQuery}</span>
                    &quot;
                  </p>
                </div>
              )}

            {/* Empty State */}
            {debouncedQuery.length < 2 && !isFetching && (
              <div className="flex flex-col items-center justify-center pt-16 gap-2 text-center">
                <IoSearchOutline className="w-10 h-10 text-gray-700 mb-2" />
                <p className="text-[12px] text-gray-500 font-medium">
                  Start typing to search
                </p>
                <p className="text-[10px] text-gray-700 uppercase tracking-wider">
                  Minimum 2 characters required
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
