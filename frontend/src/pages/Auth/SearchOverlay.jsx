import { useState, useEffect, useRef } from "react";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useGetProductsQuery } from "../../redux/api/productApiSlice";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [pendingNavigateTo, setPendingNavigateTo] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useBodyScrollLock(open);

  useEffect(() => {
    if (open) {
      setQuery("");
      setDebouncedQuery("");
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, open]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useGetProductsQuery(
    { keyword: debouncedQuery, page: 1 },
    { skip: debouncedQuery.length < 2 },
  );

  const results = data?.products ?? [];

  const handleResultClick = (e, to) => {
    e.preventDefault();
    setPendingNavigateTo(to);
    onClose();
  };

  // Framer motion remove করে setTimeout দিয়ে route change delay করা হয়েছে
  // যাতে scroll-unlock এবং route-change একসাথে না ঘটে এবং jump না করে
  useEffect(() => {
    if (!open && pendingNavigateTo) {
      const timer = setTimeout(() => {
        navigate(pendingNavigateTo);
        setPendingNavigateTo(null);
      }, 250); // CSS transition শেষ হওয়ার জন্য delay
      return () => clearTimeout(timer);
    }
  }, [open, pendingNavigateTo, navigate]);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 top-14 sm:top-16 lg:top-[68px] z-[1000] bg-[#1A1A1A] border-t border-white/10 flex flex-col transition-all duration-200 ease-out ${
        open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 delay-200"
      }`}
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
              aria-label="Clear search"
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
        {/* Skeleton Loading */}
        {isFetching && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col gap-2 sm:gap-3">
                <div className="aspect-square bg-[#252525] rounded-lg border border-white/5"></div>
                <div className="h-3 bg-[#252525] rounded w-3/4"></div>
                <div className="h-3 bg-[#252525] rounded w-1/2"></div>
              </div>
            ))}
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
                {results.map((product) => {
                  const to = `/product/${product.slug || product._id}`;
                  return (
                    <Link
                      key={product._id}
                      to={to}
                      onClick={(e) => handleResultClick(e, to)}
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
                  );
                })}
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
    </div>
  );
}
