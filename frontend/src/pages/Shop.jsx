/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetFilteredProductsQuery,
  useGetProductsQuery,
} from "@redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import {
  setCategories,
  setProducts,
  setChecked,
  setRadio,
} from "../redux/features/shop/shopSlice";
import {
  FaTimes,
  FaFilter,
  FaChevronRight,
  FaChevronLeft,
  FaUndoAlt,
  FaFolder,
  FaFolderOpen,
  FaRegSquare,
  FaRegCheckSquare,
  FaChevronDown,
  FaThLarge,
  FaList,
  FaSortAmountDown,
  FaSlidersH,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import CheckboxTree from "react-checkbox-tree";
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Range } from "react-range";
import ProductCard from "./Products/ProductCard";
import Breadcrumb from "../components/breadcrumb/Breadcrumb";

// ─── Price Range Slider ─────────────────────────────────────────────────────
const PriceRangeSlider = ({ min, max, value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <FaSlidersH className="text-[#B88E2F]" /> Price Range
        </h3>
        <span className="text-xs font-bold text-[#B88E2F] bg-[#B88E2F]/10 px-2 py-0.5 rounded-md">
          ৳{localValue[0].toLocaleString()} - ৳{localValue[1].toLocaleString()}
        </span>
      </div>
      <div className="px-1 py-2">
        <Range
          step={500}
          min={min}
          max={max}
          values={localValue}
          onChange={(vals) => setLocalValue(vals)}
          onFinalChange={(vals) => onChange(vals)}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="h-1.5 w-full bg-gray-200 rounded-full relative"
            >
              <div
                className="absolute h-full bg-[#B88E2F] rounded-full"
                style={{
                  left: `${((localValue[0] - min) / (max - min)) * 100}%`,
                  width: `${((localValue[1] - localValue[0]) / (max - min)) * 100}%`,
                }}
              />
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              className="w-4 h-4 bg-white border-2 border-[#B88E2F] rounded-full shadow-none focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/30 cursor-grab active:cursor-grabbing"
            />
          )}
        />
      </div>
    </div>
  );
};

// ─── Skeleton Loaders ───────────────────────────────────────────────────────
const ProductSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-[200px] bg-gray-100"></div>
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
  </div>
);

const FilterSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-2 bg-gray-100 rounded-full mt-4"></div>
    </div>
    <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="space-y-3 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-5 bg-gray-100 rounded-md"></div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Pagination ─────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages = [1, 2, 3, 4, "...", totalPages];
    } else if (currentPage >= totalPages - 2) {
      pages = [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    } else {
      pages = [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      ];
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:border-[#B88E2F] hover:text-[#B88E2F] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FaChevronLeft size={12} />
      </button>
      {getPages().map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${page === currentPage ? "bg-[#B88E2F] text-white" : page === "..." ? "text-gray-400 cursor-default bg-transparent" : "bg-white border border-gray-200 text-gray-700 hover:border-[#B88E2F] hover:text-[#B88E2F]"}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:border-[#B88E2F] hover:text-[#B88E2F] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FaChevronRight size={12} />
      </button>
    </div>
  );
};

// ─── Sort Function ──────────────────────────────────────────────────────────
const sortProducts = (products, sortType) => {
  const sorted = [...products];
  switch (sortType) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "bestselling":
      return sorted.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    case "rating":
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
  }
};

// ─── Helpers for Nested Tree Data ───────────────────────────────────────────

// 1. Format nested API data for react-checkbox-tree
const formatCategoriesToTree = (categories) => {
  if (!categories || categories.length === 0) return [];
  return categories.map((cat) => ({
    value: cat._id,
    label: cat.name,
    children:
      cat.children && cat.children.length > 0
        ? formatCategoriesToTree(cat.children)
        : null,
  }));
};

// 2. Find Category Path recursively for Breadcrumbs
const findCategoryPath = (categories, targetId, currentPath = []) => {
  if (!categories || categories.length === 0) return null;

  for (const cat of categories) {
    const newPath = [
      ...currentPath,
      { label: cat.name, href: `/shop?category=${cat._id}`, id: cat._id },
    ];

    if (cat._id === targetId) {
      return newPath;
    }

    if (cat.children && cat.children.length > 0) {
      const foundPath = findCategoryPath(cat.children, targetId, newPath);
      if (foundPath) return foundPath;
    }
  }
  return null;
};

// ─── Main Shop Component ────────────────────────────────────────────────────
const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { keyword: urlKeyword } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get("category");

  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState(queryParams.get("sort") || "newest");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState([]);

  const dispatch = useDispatch();
  const { categories, products, checked, selectedBrand } = useSelector(
    (state) => state.shop,
  );

  const categoriesQuery = useFetchCategoriesQuery();
  const hasCategoryFilter = checked.length > 0;

  const { data: productsData, isLoading: isProductsLoading } =
    useGetProductsQuery(
      {
        keyword: urlKeyword || "",
        page: currentPage,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      },
      { skip: hasCategoryFilter },
    );

  const filteredProductsQuery = useGetFilteredProductsQuery(
    { checked, radio: priceRange },
    { skip: !hasCategoryFilter },
  );

  const isLoading = hasCategoryFilter
    ? filteredProductsQuery.isLoading
    : isProductsLoading;

  // Memoize tree data conversion
  const treeData = useMemo(() => {
    return formatCategoriesToTree(categories);
  }, [categories]);

  // Memoize category path for breadcrumbs
  const categoryPath = useMemo(() => {
    if (!categoryId || !categories || categories.length === 0) return [];
    return findCategoryPath(categories, categoryId) || [];
  }, [categories, categoryId]);

  // Effects
  useEffect(() => {
    if (categoryId && categories?.length > 0) {
      dispatch(setChecked([categoryId]));
      // Auto-expand parent categories
      const ancestorIds = categoryPath.map((c) => c.id).slice(0, -1);
      setExpanded((prev) => [
        ...new Set([...prev, ...ancestorIds, categoryId]),
      ]);
    }
  }, [categoryId, categories, dispatch, categoryPath]);

  useEffect(() => {
    if (!categoriesQuery.isLoading && categoriesQuery.data)
      dispatch(setCategories(categoriesQuery.data));
  }, [categoriesQuery.isLoading, categoriesQuery.data, dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [urlKeyword, checked, selectedBrand, priceRange, sortBy]);

  // Product Filtering & Sorting Logic
  useEffect(() => {
    let finalProducts = [];

    if (hasCategoryFilter) {
      finalProducts = filteredProductsQuery.data || [];
    } else {
      finalProducts = productsData?.products || [];
    }

    if (finalProducts.length > 0 && selectedBrand) {
      finalProducts = finalProducts.filter((p) => p.brand === selectedBrand);
    }

    dispatch(setProducts(sortProducts(finalProducts, sortBy)));
  }, [
    hasCategoryFilter,
    filteredProductsQuery.data,
    productsData,
    dispatch,
    priceRange,
    sortBy,
    selectedBrand,
  ]);

  // Handlers
  const scrollToTop = useCallback(
    () => window.scrollTo({ top: 0, behavior: "smooth" }),
    [],
  );

  const handleBrandClick = (brand) => {
    dispatch(setRadio(selectedBrand === brand ? "" : brand));
    setCurrentPage(1);
    scrollToTop();
  };

  const handleCheckChange = (newChecked) => {
    dispatch(setChecked(newChecked));
    setCurrentPage(1);
    scrollToTop();
    // Sync URL with checked category
    if (newChecked.length > 0) {
      navigate(`/shop?category=${newChecked[newChecked.length - 1]}`, {
        replace: true,
      });
    } else {
      navigate("/shop", { replace: true });
    }
  };

  const handleResetFilters = () => {
    setPriceRange([0, 100000]);
    setSortBy("newest");
    setCurrentPage(1);
    dispatch(setChecked([]));
    dispatch(setRadio(""));
    setExpanded([]);
    navigate("/shop");
    scrollToTop();
  };

  const totalPages = hasCategoryFilter ? 1 : productsData?.pages || 1;
  const paginatedProducts = hasCategoryFilter
    ? products
    : products?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      );

  const baseDataForBrands = hasCategoryFilter
    ? filteredProductsQuery.data
    : productsData?.products || [];
  const uniqueBrands = [
    ...new Set((baseDataForBrands || []).map((p) => p.brand).filter(Boolean)),
  ];

  // Filter UI Component
  const FilterContent = () => (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-100">
        <PriceRangeSlider
          min={0}
          max={100000}
          value={priceRange}
          onChange={setPriceRange}
        />
      </div>
      <div className="bg-white p-5 rounded-xl border border-gray-100">
        <h3 className="text-xs font-bold mb-4 flex items-center gap-2 text-gray-800 uppercase tracking-widest">
          <span className="w-1 h-4 bg-[#B88E2F] rounded-full"></span> Categories
        </h3>
        <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {categories?.length > 0 ? (
            <div className="light-tree-wrapper">
              <CheckboxTree
                nodes={treeData}
                checked={checked}
                expanded={expanded}
                onCheck={handleCheckChange}
                onExpand={setExpanded}
                icons={{
                  check: <FaRegCheckSquare className="text-[#B88E2F]" />,
                  uncheck: <FaRegSquare className="text-gray-300" />,
                  halfCheck: (
                    <FaRegCheckSquare className="text-[#B88E2F] opacity-50" />
                  ),
                  expandClose: (
                    <FaChevronRight className="text-gray-400 text-[10px]" />
                  ),
                  expandOpen: (
                    <FaChevronDown className="text-[#B88E2F] text-[10px]" />
                  ),
                  parentClose: <FaFolder className="text-gray-400 text-xs" />,
                  parentOpen: (
                    <FaFolderOpen className="text-[#B88E2F] text-xs" />
                  ),
                  leaf: (
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full ml-1" />
                  ),
                }}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-gray-100 animate-pulse rounded-md"
                ></div>
              ))}
            </div>
          )}
        </div>
      </div>

      {uniqueBrands.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-gray-100">
          <h3 className="text-xs font-bold mb-4 flex items-center gap-2 text-gray-800 uppercase tracking-widest">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span> Brands
          </h3>
          <div className="flex flex-wrap gap-2">
            {uniqueBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrandClick(brand)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                  selectedBrand === brand
                    ? "bg-[#B88E2F] text-white border-[#B88E2F]"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleResetFilters}
        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-[#B88E2F] transition-all flex items-center justify-center gap-2 text-sm"
      >
        <FaUndoAlt size={10} /> Reset All
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      <Breadcrumb
        items={[
          { label: "Shop", href: "/shop" },
          ...categoryPath.map((cat, index) => ({
            label: cat.label,
            href: index === categoryPath.length - 1 ? undefined : cat.href,
          })),
          ...(urlKeyword && !categoryId
            ? [{ label: `Search: "${urlKeyword}"` }]
            : []),
        ]}
      />

      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-[280px] sticky top-24 self-start">
          {categoriesQuery.isLoading || isLoading ? (
            <FilterSkeleton />
          ) : (
            <FilterContent />
          )}
        </aside>

        <AnimatePresence>
          {isSidebarOpen && (
            <div className="fixed inset-0 z-[1000] lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween" }}
                className="absolute right-0 top-0 h-full w-[300px] bg-white p-6 shadow-none overflow-y-auto border-l border-gray-100"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
                <FilterContent />
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <main className="flex-1 w-full">
          {urlKeyword && !categoryId && (
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Found{" "}
                <span className="font-bold text-[#B88E2F]">
                  {products?.length || 0}
                </span>{" "}
                results for
                <span className="font-bold text-gray-900">
                  {" "}
                  &ldquo;{urlKeyword}&rdquo;
                </span>
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-3 rounded-xl border border-gray-100">
            <p className="text-gray-500 text-xs font-medium px-2">
              {isLoading ? "..." : products?.length || 0} Products
            </p>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white text-[#B88E2F]" : "text-gray-400"}`}
                >
                  <FaThLarge size={12} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white text-[#B88E2F]" : "text-gray-400"}`}
                >
                  <FaList size={12} />
                </button>
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/20 cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low</option>
                  <option value="price-high">Price: High</option>
                  <option value="bestselling">Best Selling</option>
                  <option value="rating">Top Rated</option>
                </select>
                <FaSortAmountDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
              </div>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-[#B88E2F] text-white rounded-lg text-xs font-bold"
              >
                <FaFilter size={10} /> Filters
              </button>
            </div>
          </div>

          {isLoading ? (
            <div
              className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Try adjusting your filters
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2 bg-[#B88E2F] text-white rounded-lg font-bold text-sm hover:bg-[#9a7828] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div
                className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
              >
                {paginatedProducts?.map((p) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ProductCard p={p} viewMode={viewMode} />
                  </motion.div>
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  scrollToTop();
                }}
              />
            </>
          )}
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #B88E2F; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .light-tree-wrapper .react-checkbox-tree { font-family: inherit; font-size: 13px; }
        .light-tree-wrapper .rct-text { padding: 3px 0; transition: all 0.2s; border-radius: 6px; }
        .light-tree-wrapper .rct-text:hover { background: rgba(184, 142, 47, 0.05); }
        .light-tree-wrapper .rct-title { padding-left: 6px; color: #4b5563; font-weight: 500; }
        .light-tree-wrapper .rct-node-clickable:hover .rct-title { color: #000; }
        .light-tree-wrapper label { margin-bottom: 0; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default Shop;
