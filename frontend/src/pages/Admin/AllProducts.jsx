/* eslint-disable react/prop-types */
import { useEffect, useState, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { useAllProductsQuery } from "@redux/api/productApiSlice";
import AdminMenu from "./AdminMenu";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSortAmountDown,
  FaBox,
  FaExternalLinkAlt,
} from "react-icons/fa";

// --- Skeleton Components for Smooth Loading ---
const TableSkeleton = () => (
  <div className="hidden md:block border border-gray-200 rounded-sm">
    <div className="bg-gray-50 border-b border-gray-200 p-4">
      <div className="flex gap-4">
        {[...Array(7)].map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>)}
      </div>
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-100 flex gap-4 items-center">
        <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>
    ))}
  </div>
);

const CardSkeleton = () => (
  <div className="md:hidden space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="border border-gray-200 p-4 rounded-sm bg-white">
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

// --- Memoized Sub-Components for Performance ---
const ProductRow = memo(function ProductRow({ product }) {
  return (
    <tr className="group hover:bg-gray-50 transition-colors">
      <td className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-black group-hover:text-red-600 transition-colors uppercase tracking-tight max-w-[200px] truncate font-['Playfair_Display']">
            {product.name}
          </span>
          <span className="text-sm text-gray-500 font-bold tracking-widest mt-1">
            {product.brand || "GENERIC"}
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className="w-14 h-14 border border-gray-200 p-0.5 group-hover:border-black transition-all overflow-hidden bg-white">
          <img
            src={Array.isArray(product.images) ? product.images[0] : product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </td>
      <td className="p-4">
        <span className="px-3 py-1 bg-gray-100 text-sm font-bold uppercase text-gray-600 border border-gray-200 rounded-sm tracking-tighter">
          {product.category?.name || "N/A"}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <FaBox size={12} className="text-gray-400" />
          <span className={`text-sm font-bold ${product.countInStock < 10 ? "text-orange-600" : "text-black"}`}>
            {product.countInStock} <span className="text-sm text-gray-400 font-normal">Units</span>
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex flex-col">
          <span className="text-base font-black text-black font-['Playfair_Display']">
            <span className="text-red-600 text-sm mr-0.5 font-normal">৳</span>
            {product.price.toLocaleString()}
          </span>
          {product.discountPercentage > 0 && (
            <span className="text-sm text-red-600 font-bold">
              -{product.discountPercentage}%
            </span>
          )}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${product.countInStock > 0 ? "bg-green-500" : "bg-red-600"}`}></div>
          <span className={`text-sm font-bold uppercase tracking-widest ${product.countInStock > 0 ? "text-green-600" : "text-red-600"}`}>
            {product.countInStock > 0 ? "In Stock" : "Depleted"}
          </span>
        </div>
      </td>
      <td className="p-4 text-right">
        <Link
          to={`/admin/product/update/${product._id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-all rounded-sm"
        >
          Update <FaExternalLinkAlt size={10} />
        </Link>
      </td>
    </tr>
  );
});

const ProductCard = memo(function ProductCard({ product }) {
  return (
    <div className="border border-gray-200 p-4 rounded-sm bg-white hover:border-black transition-colors">
      <div className="flex gap-4">
        <div className="relative w-16 h-16 border border-gray-200 p-1 flex-shrink-0 bg-white">
          <img
            src={Array.isArray(product.images) ? product.images[0] : product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-black uppercase tracking-tight truncate font-['Playfair_Display']">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 font-bold tracking-widest mt-1">
            {product.brand || "GENERIC"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
        <div>
          <span className="text-sm font-bold text-gray-400 uppercase block mb-1">Category</span>
          <span className="text-sm font-bold text-black">{product.category?.name || "N/A"}</span>
        </div>
        <div>
          <span className="text-sm font-bold text-gray-400 uppercase block mb-1">Price</span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-gray-400">৳</span>
            <span className="text-base font-black text-black">{product.price.toLocaleString()}</span>
            {product.discountPercentage > 0 && (
              <span className="text-sm text-red-600 font-bold">-{product.discountPercentage}%</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-sm font-bold text-gray-400 uppercase block mb-1">Stock</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${product.countInStock < 10 ? "text-orange-600" : "text-black"}`}>
              {product.countInStock} Units
            </span>
            <div className={`w-2 h-2 rounded-full ${product.countInStock > 0 ? "bg-green-500" : "bg-red-600"}`}></div>
          </div>
        </div>
        <div className="flex items-end justify-end">
          <Link
            to={`/admin/product/update/${product._id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-all rounded-sm"
          >
            Edit <FaExternalLinkAlt size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
});

const AllProducts = () => {
  const { data: products, isLoading, isError, refetch } = useAllProductsQuery();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Optimized filtering and sorting using useMemo
  const sortedProducts = useMemo(() => {
    if (!products) return [];
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (sortConfig.key) {
        const valA = sortConfig.key === "category" ? a.category?.name : a[sortConfig.key];
        const valB = sortConfig.key === "category" ? b.category?.name : b[sortConfig.key];
        
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [products, searchTerm, sortConfig]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-['Trebuchet_MS'] font-bold italic text-lg">
        ERROR: FAILED_TO_LOAD_DATABASE
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />
      
      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header Section */}
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
            <div>
           
              <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
                Total Managed Items: {sortedProducts.length}
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative group w-full md:w-96">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors text-sm" />
              <input
                type="text"
                placeholder="SEARCH BY NAME..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-gray-200 rounded-sm py-3 pl-10 pr-4 text-sm font-bold text-black focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          </header>

          {/* Quick Stats & Filters Panel */}
          <section className="bg-black text-white p-4 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-gray-800">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Page Size:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent border border-gray-700 text-sm font-bold px-3 py-1.5 focus:outline-none focus:border-red-600 cursor-pointer rounded-sm"
                >
                  {[5, 10, 20, 50].map((val) => (
                    <option key={val} value={val} className="text-black">
                      {val}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="hidden md:block text-sm font-bold tracking-widest text-gray-500 italic">
              STATUS: SECURE_ACCESS
            </div>
          </section>

          {/* Loading State vs Content */}
          {isLoading ? (
            <>
              <CardSkeleton />
              <TableSkeleton />
            </>
          ) : (
            <>
              {/* MOBILE VIEW: Card Layout (Visible < md) */}
              <div className="md:hidden space-y-4">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
                ) : (
                  <div className="text-center py-16 text-gray-400 font-bold uppercase tracking-widest text-sm">
                    No Products Found
                  </div>
                )}
              </div>

              {/* DESKTOP VIEW: Table Layout (Visible >= md) */}
              <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-sm bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {[
                        { label: "Product", key: "name" },
                        { label: "Image", key: null },
                        { label: "Category", key: "category" },
                        { label: "Stock", key: "countInStock" },
                        { label: "Price", key: "price" },
                        { label: "Status", key: null },
                        { label: "Action", key: null },
                      ].map((col, i) => (
                        <th
                          key={i}
                          onClick={() => col.key && handleSort(col.key)}
                          className={`p-4 text-sm font-bold uppercase tracking-widest text-gray-500 ${col.key ? "cursor-pointer hover:text-black" : ""} transition-colors`}
                        >
                          <div className="flex items-center gap-1.5">
                            {col.label}
                            {col.key && (
                              <FaSortAmountDown
                                size={12}
                                className={sortConfig.key === col.key ? "text-black" : "text-gray-300"}
                              />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentProducts.length > 0 ? (
                      currentProducts.map((product) => (
                        <ProductRow key={product._id} product={product} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-16 text-gray-400 font-bold uppercase tracking-widest text-sm">
                          No Products Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Navigation */}
              {currentProducts.length > 0 && (
                <nav className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Showing{" "}
                    <span className="text-black font-black">
                      {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedProducts.length)}
                    </span>{" "}
                    of{" "}
                    <span className="text-red-600 font-black">
                      {sortedProducts.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-3 border border-gray-200 text-black hover:border-black disabled:opacity-20 disabled:cursor-not-allowed transition-all rounded-sm"
                      aria-label="Previous Page"
                    >
                      <FaChevronLeft size={14} />
                    </button>

                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 text-sm font-bold transition-all rounded-sm ${currentPage === i + 1 ? "bg-black text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black"}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-3 border border-gray-200 text-black hover:border-black disabled:opacity-20 disabled:cursor-not-allowed transition-all rounded-sm"
                      aria-label="Next Page"
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AllProducts;