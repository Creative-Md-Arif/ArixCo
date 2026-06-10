/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminMenu from "./AdminMenu";
import {
  useGetAllBannersQuery,
  useToggleBannerStatusMutation,
  useDeleteBannerMutation,
  useGetBannerStatsQuery,
} from "@redux/api/bannerApiSlice";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaImage,
  FaChartBar,
  FaMousePointer,
} from "react-icons/fa";

// Custom Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-screen gap-4">
    <div className="flex items-center justify-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce"></div>
    </div>
    <p className="text-[10px] font-black tracking-[0.5em] uppercase text-gray-400 animate-pulse">
      Loading Assets...
    </p>
  </div>
);

const BannerList = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: banners, isLoading, refetch } = useGetAllBannersQuery();
  const { data: stats } = useGetBannerStatsQuery();
  const [toggleStatus] = useToggleBannerStatusMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  const filteredBanners = banners?.filter((banner) => {
    const typeMatch = filterType === "all" || banner.type === filterType;
    const statusMatch =
      filterStatus === "all" ||
      (filterStatus === "active" && banner.isActive) ||
      (filterStatus === "inactive" && !banner.isActive);
    return typeMatch && statusMatch;
  });

  const handleToggleStatus = async (id) => {
    try {
      await toggleStatus(id).unwrap();
      toast.success("Status updated successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete banner "${name}"?`)) return;
    try {
      await deleteBanner(id).unwrap();
      toast.success("Banner deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete banner");
    }
  };

  const bannerTypes = [
    { value: "hero", label: "Hero" },
    { value: "category", label: "Category" },
    { value: "promotional", label: "Promo" },
    { value: "sidebar", label: "Sidebar" },
    { value: "popup", label: "Popup" },
    { value: "footer", label: "Footer" },
    { value: "top-bar", label: "Top Bar" },
    { value: "middle", label: "Middle" },
  ];

  const getTypeLabel = (type) => {
    return bannerTypes.find((t) => t.value === type)?.label || type;
  };

  if (isLoading) return <LoadingSpinner />;

  // Reusable Select Style
  const selectClass =
    "bg-white border border-gray-200 rounded-sm px-3 py-2 text-[10px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-black focus:border-black outline-none transition-all cursor-pointer";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-mono pt-10 pb-16 transition-all duration-500">
      <div className="flex flex-col 2xl:flex-row">
        <AdminMenu />
        <div className="flex-1 px-4 sm:px-6 lg:px-12">
          <div className="max-w-[1500px] mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-l-4 border-black pl-4 sm:pl-6 py-2 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tighter uppercase">
                  Banner / <span className="text-red-600">Management</span>
                </h1>
                <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">
                  Manage All Placements & Creatives
                </p>
              </div>
              <Link to="/admin/banner/create">
                <button className="bg-black text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 rounded-sm w-full md:w-auto justify-center">
                  <FaPlus size={10} /> Create Banner
                </button>
              </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors">
                  <div className="flex items-center gap-3">
                    <FaImage className="text-lg text-gray-400" />
                    <div>
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                        Total Banners
                      </p>
                      <p className="text-xl sm:text-2xl font-black text-black">
                        {stats.totalBanners}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors">
                  <div className="flex items-center gap-3">
                    <FaEye className="text-lg text-gray-400" />
                    <div>
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                        Active
                      </p>
                      <p className="text-xl sm:text-2xl font-black text-black">
                        {stats.activeBanners}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors">
                  <div className="flex items-center gap-3">
                    <FaMousePointer className="text-lg text-gray-400" />
                    <div>
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                        Total Clicks
                      </p>
                      <p className="text-xl sm:text-2xl font-black text-black">
                        {stats.byType?.reduce(
                          (acc, t) => acc + t.totalClicks,
                          0,
                        ) || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors">
                  <div className="flex items-center gap-3">
                    <FaChartBar className="text-lg text-gray-400" />
                    <div>
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                        Impressions
                      </p>
                      <p className="text-xl sm:text-2xl font-black text-black">
                        {stats.byType?.reduce(
                          (acc, t) => acc + t.totalImpressions,
                          0,
                        ) || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 border border-gray-200 rounded-sm bg-white">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`${selectClass} w-full sm:w-auto`}
              >
                <option value="all">All Types</option>
                {bannerTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`${selectClass} w-full sm:w-auto`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Banner Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredBanners?.map((banner, index) => (
                <motion.div
                  key={banner._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white border border-gray-200 rounded-sm overflow-hidden hover:border-black transition-colors group"
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden bg-gray-50 border-b border-gray-200">
                    <img
                      src={banner.image}
                      alt={banner.headline}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span className="bg-black text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">
                        {getTypeLabel(banner.type)}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span
                        className={`border text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 ${
                          banner.isActive
                            ? "bg-white text-black border-black"
                            : "bg-white text-gray-500 border-gray-300"
                        }`}
                      >
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-black text-sm text-black mb-0.5 uppercase tracking-tight truncate">
                      {banner.headline}
                    </h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3 truncate">
                      {banner.name}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4 mb-4 text-[9px] text-gray-500 font-bold uppercase tracking-wider border-t border-b border-gray-100 py-2">
                      <span className="flex items-center gap-1">
                        <FaMousePointer size={9} className="text-gray-400" />{" "}
                        {banner.clicks || 0} Clicks
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye size={9} className="text-gray-400" />{" "}
                        {banner.impressions || 0} Views
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(banner._id)}
                        className={`flex-1 py-1.5 border text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1 ${
                          banner.isActive
                            ? "border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black"
                            : "border-black text-black hover:bg-black hover:text-white"
                        }`}
                      >
                        {banner.isActive ? (
                          <FaEyeSlash size={9} />
                        ) : (
                          <FaEye size={9} />
                        )}
                        {banner.isActive ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/banner/update/${banner._id}`)
                        }
                        className="flex-1 py-1.5 border border-gray-200 text-gray-600 hover:border-black hover:text-black text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1"
                      >
                        <FaEdit size={9} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id, banner.name)}
                        className="flex-1 py-1.5 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1"
                      >
                        <FaTrash size={9} /> Del
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredBanners?.length === 0 && (
              <div className="text-center py-20 border border-dashed border-gray-200 rounded-sm bg-white">
                <FaImage className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                  No banners found
                </p>
                <Link
                  to="/admin/banner/create"
                  className="inline-block mt-4 text-red-600 font-black uppercase tracking-widest text-xs hover:underline"
                >
                  Create your first banner
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerList;
