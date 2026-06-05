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
  FaSpinner,
} from "react-icons/fa";

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
      <div className="flex flex-col justify-center items-center h-screen bg-white font-mono">
        <FaSpinner className="animate-spin text-red-600 mb-4" size={40} />

        <p className="text-[10px] font-black tracking-[0.5em] uppercase animate-pulse">
          Initializing_Assets...
        </p>
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-mono font-black italic">
        FATAL_ERROR: FAILED_TO_LOAD_DATABASE
      </div>
    );

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
    <div className="min-h-screen bg-white font-mono pt-24 lg:pt-32 transition-all duration-500">
      <div className="flex flex-col 2xl:flex-row">
        <AdminMenu />

        <div className="flex-1 px-4 lg:px-12 pb-20">
          <div className="max-w-[1500px] mx-auto">
            {/* Header Section */}

            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-l-4 border-red-600 pl-6 py-2 gap-4">
              <div>
                <h1 className="text-3xl font-black text-black tracking-tighter uppercase">
                  All Product_<span className="text-red-600">List</span>
                </h1>

                <p className="text-[10px] text-gray-500 font-bold tracking-[0.4em] uppercase mt-1">
                  Total Managed Items: {filteredProducts.length}
                </p>
              </div>

              {/* Enhanced Search Bar */}

              <div className="relative group w-full md:w-96">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />

                <input
                  type="text"
                  placeholder="SEARCH_BY_ASSET_NAME..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border-b-2 border-gray-100 py-3 pl-10 pr-4 font-bold text-black focus:outline-none focus:border-red-600 transition-all duration-300 placeholder:text-gray-300 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Quick Stats & Filters Panel */}

            <div className="bg-black text-white p-4 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-sm shadow-xl">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    Page_Size:
                  </span>

                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));

                      setCurrentPage(1);
                    }}
                    className="bg-transparent border border-gray-800 text-[11px] font-bold px-2 py-1 focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    {[5, 10, 20, 50].map((val) => (
                      <option key={val} value={val} className="text-black">
                        {val}_UNITS
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hidden md:block text-[10px] font-bold tracking-[0.2em] text-red-500 italic">
                SYSTEM_STATUS: SECURE_ENCRYPTED_ACCESS
              </div>
            </div>

            {/* Main Inventory Table */}

            {/* Main Inventory Table */}

            <div className="overflow-x-auto border border-gray-100 shadow-2xl rounded-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-100">
                    {[
                      { label: "Asset_Registry", key: "name" },

                      { label: "Visual_Log", key: null },

                      { label: "Category", key: "category" }, // New

                      { label: "Inventory_Level", key: "countInStock" }, // New

                      { label: "Unit_Price", key: "price" },

                      { label: "Status", key: null }, // New (Stock Status)

                      { label: "Control_Actions", key: null },
                    ].map((col, i) => (
                      <th
                        key={i}
                        onClick={() => col.key && handleSort(col.key)}
                        className={`p-5 text-[11px] font-black uppercase tracking-widest text-gray-400 ${col.key ? "cursor-pointer hover:text-red-600" : ""} transition-colors`}
                      >
                        <div className="flex items-center gap-2">
                          {col.label}

                          {col.key && (
                            <FaSortAmountDown
                              size={10}
                              className={
                                sortConfig.key === col.key
                                  ? "text-red-600"
                                  : "text-gray-200"
                              }
                            />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {currentProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="group hover:bg-red-50/30 transition-all duration-300"
                    >
                      {/* Asset Name & Brand */}

                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-black text-black group-hover:text-red-600 transition-colors uppercase tracking-tight">
                            {product.name}
                          </span>

                          <span className="text-[9px] text-gray-400 font-bold tracking-widest italic">
                            {product.brand || "GENERIC_GEAR"}
                          </span>
                        </div>
                      </td>

                      {/* Image Log */}

                      <td className="p-5">
                        <div className="relative w-14 h-14 border border-gray-200 p-1 group-hover:border-red-600 transition-all overflow-hidden bg-white">
                          <img
                            src={
                              Array.isArray(product.images)
                                ? product.images[0]
                                : product.image
                            }
                            alt={product.name}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110"
                          />
                        </div>
                      </td>

                      {/* Category Badge (New) */}

                      <td className="p-5">
                        <span className="px-3 py-1 bg-gray-100 text-[10px] font-black uppercase text-gray-600 border border-gray-200 rounded-full tracking-tighter">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>

                      {/* Quantity Count (New) */}

                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <FaBox size={10} className="text-gray-400" />

                          <span
                            className={`text-[13px] font-bold ${product.countInStock < 10 ? "text-orange-600" : "text-black"}`}
                          >
                            {product.countInStock}{" "}
                            <span className="text-[10px] text-gray-400 font-normal">
                              Units
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Price & Discount (New Look) */}

                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-[15px] font-black text-black">
                            <span className="text-red-600 text-[10px] mr-1 font-normal">
                              BDT
                            </span>

                            {product.price.toLocaleString()}
                          </span>

                          {product.discountPercentage > 0 && (
                            <span className="text-[9px] text-green-600 font-black italic">
                              -{product.discountPercentage}% OFF
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Status Badge (New) */}

                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full animate-pulse ${product.countInStock > 0 ? "bg-green-500" : "bg-red-600"}`}
                          ></div>

                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${product.countInStock > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {product.countInStock > 0 ? "IN_STOCK" : "DEPLETED"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}

                      <td className="p-5 text-right">
                        <Link
                          to={`/admin/product/update/${product._id}`}
                          className="relative inline-flex items-center gap-2 px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest overflow-hidden group/btn transition-all hover:bg-red-600"
                        >
                          <span className="relative z-10">Sync_Update</span>

                          <FaExternalLinkAlt
                            className="relative z-10 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"
                            size={10}
                          />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modern Pagination Navigation */}

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100 pt-8">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Displaying{" "}
                <span className="text-black italic">
                  {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, sortedProducts.length)}
                </span>{" "}
                / Total_Volume{" "}
                <span className="text-red-600">{sortedProducts.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-3 border-2 border-gray-100 text-black hover:border-red-600 hover:text-red-600 disabled:opacity-20 disabled:hover:border-gray-100 disabled:cursor-not-allowed transition-all"
                >
                  <FaChevronLeft size={14} />
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 text-[12px] font-black transition-all ${currentPage === i + 1 ? "bg-black text-white scale-110 shadow-lg" : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600"}`}
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
                  className="p-3 border-2 border-gray-100 text-black hover:border-red-600 hover:text-red-600 disabled:opacity-20 disabled:hover:border-gray-100 disabled:cursor-not-allowed transition-all"
                >
                  <FaChevronRight size={14} />
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
