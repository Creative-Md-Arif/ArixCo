import { useEffect, useState } from "react";
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

// Custom Loading Spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center gap-1.5">
    <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce"></div>
  </div>
);

const AllProducts = () => {
  const { data: products, isLoading, isError, refetch } = useAllProductsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#fdfdfd] font-mono">
        <LoadingSpinner />
        <p className="text-[10px] font-black tracking-[0.5em] uppercase animate-pulse mt-6 text-gray-500">
          Loading Assets...
        </p>
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-mono font-black italic text-sm">
        ERROR: FAILED_TO_LOAD_DATABASE
      </div>
    );

  const filteredProducts = products
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-mono pt-10 pb-16 transition-all duration-500">
      <div className="flex flex-col 2xl:flex-row">
        <AdminMenu />
        <div className="flex-1 px-4 sm:px-6 lg:px-12">
          <div className="max-w-[1500px] mx-auto">
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-l-4 border-black pl-4 sm:pl-6 py-2 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tighter uppercase">
                  All Product / <span className="text-red-600">Inventory</span>
                </h1>
                <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase mt-1">
                  Total Managed Items: {filteredProducts.length}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative group w-full md:w-96">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors text-sm" />
                <input
                  type="text"
                  placeholder="SEARCH_BY_NAME..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-gray-200 rounded-sm py-2.5 pl-9 pr-4 text-sm font-bold text-black focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-300 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Quick Stats & Filters Panel */}
            <div className="bg-black text-white p-3 sm:p-4 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-gray-800">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    Page Size:
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-transparent border border-gray-700 text-[10px] sm:text-[11px] font-bold px-2 py-1 focus:outline-none focus:border-red-600 cursor-pointer rounded-sm"
                  >
                    {[5, 10, 20, 50].map((val) => (
                      <option key={val} value={val} className="text-black">
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="hidden md:block text-[9px] font-bold tracking-[0.2em] text-gray-500 italic">
                STATUS: SECURE_ACCESS
              </div>
            </div>

            {/* ============================================ */}
            {/* MOBILE VIEW: Card Layout (Visible < md) */}
            {/* ============================================ */}
            <div className="md:hidden space-y-4">
              {currentProducts.map((product) => (
                <div
                  key={product._id}
                  className="border border-gray-200 p-4 rounded-sm bg-white hover:border-black transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="relative w-16 h-16 border border-gray-200 p-1 flex-shrink-0 bg-white">
                      <img
                        src={
                          Array.isArray(product.images)
                            ? product.images[0]
                            : product.image
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-black uppercase tracking-tight truncate">
                        {product.name}
                      </h3>
                      <p className="text-[9px] text-gray-400 font-bold tracking-widest mt-0.5">
                        {product.brand || "GENERIC"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                    <div>
                      <span className="text-[8px] font-bold text-gray-400 uppercase block">
                        Category
                      </span>
                      <span className="text-[11px] font-bold text-black">
                        {product.category?.name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-gray-400 uppercase block">
                        Price
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[10px] text-gray-400">৳</span>
                        <span className="text-sm font-black text-black">
                          {product.price.toLocaleString()}
                        </span>
                        {product.discountPercentage > 0 && (
                          <span className="text-[8px] text-red-600 font-bold">
                            -{product.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-gray-400 uppercase block">
                        Stock
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold ${product.countInStock < 10 ? "text-orange-600" : "text-black"}`}
                        >
                          {product.countInStock} Units
                        </span>
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${product.countInStock > 0 ? "bg-green-500" : "bg-red-600"}`}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-end justify-end">
                      <Link
                        to={`/admin/product/update/${product._id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-all rounded-sm"
                      >
                        Edit <FaExternalLinkAlt size={8} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ============================================ */}
            {/* DESKTOP VIEW: Table Layout (Visible >= md) */}
            {/* ============================================ */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-sm">
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
                        className={`p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 ${col.key ? "cursor-pointer hover:text-black" : ""} transition-colors`}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          {col.key && (
                            <FaSortAmountDown
                              size={9}
                              className={
                                sortConfig.key === col.key
                                  ? "text-black"
                                  : "text-gray-300"
                              }
                            />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {currentProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="group hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black text-black group-hover:text-red-600 transition-colors uppercase tracking-tight max-w-[200px] truncate">
                            {product.name}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold tracking-widest mt-0.5">
                            {product.brand || "GENERIC"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="w-12 h-12 border border-gray-200 p-0.5 group-hover:border-black transition-all overflow-hidden bg-white">
                          <img
                            src={
                              Array.isArray(product.images)
                                ? product.images[0]
                                : product.image
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-[9px] font-bold uppercase text-gray-600 border border-gray-200 rounded-sm tracking-tighter">
                          {product.category?.name || "N/A"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FaBox size={10} className="text-gray-300" />
                          <span
                            className={`text-[12px] font-bold ${product.countInStock < 10 ? "text-orange-600" : "text-black"}`}
                          >
                            {product.countInStock}{" "}
                            <span className="text-[9px] text-gray-400 font-normal">
                              Units
                            </span>
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-black text-black">
                            <span className="text-red-600 text-[9px] mr-0.5 font-normal">
                              ৳
                            </span>
                            {product.price.toLocaleString()}
                          </span>
                          {product.discountPercentage > 0 && (
                            <span className="text-[8px] text-red-600 font-bold">
                              -{product.discountPercentage}%
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${product.countInStock > 0 ? "bg-green-500" : "bg-red-600"}`}
                          ></div>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-widest ${product.countInStock > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {product.countInStock > 0 ? "In Stock" : "Depleted"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          to={`/admin/product/update/${product._id}`}
                          className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white text-[9px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all rounded-sm"
                        >
                          Update <FaExternalLinkAlt size={9} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Navigation */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
              <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Showing{" "}
                <span className="text-black font-black">
                  {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, sortedProducts.length)}
                </span>{" "}
                of{" "}
                <span className="text-red-600 font-black">
                  {sortedProducts.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2.5 border border-gray-200 text-black hover:border-black hover:text-black disabled:opacity-20 disabled:hover:border-gray-200 disabled:cursor-not-allowed transition-all rounded-sm"
                >
                  <FaChevronLeft size={12} />
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 text-[11px] font-bold transition-all rounded-sm ${currentPage === i + 1 ? "bg-black text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2.5 border border-gray-200 text-black hover:border-black hover:text-black disabled:opacity-20 disabled:hover:border-gray-200 disabled:cursor-not-allowed transition-all rounded-sm"
                >
                  <FaChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
