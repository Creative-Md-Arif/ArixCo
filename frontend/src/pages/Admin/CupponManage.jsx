/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaChartBar,
  FaTimes,
  FaSearch,
  FaTag,
} from "react-icons/fa";
import {
  useGetCupponsQuery,
  useCreateCupponMutation,
  useUpdateCupponMutation,
  useDeleteCupponMutation,
  useToggleCupponStatusMutation,
  useLazyGetCupponStatsQuery,
} from "@redux/api/cupponApiSlice";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { useGetProductsQuery } from "@redux/api/productApiSlice";
import AdminMenu from "./AdminMenu";

const initialFormState = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 0,
  minimumOrderAmount: 0,
  maximumDiscountAmount: "",
  usageLimit: "",
  perUserLimit: 1,
  isFirstTimeOnly: false,
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  isActive: true,
  applicableCategories: [],
  applicableProducts: [],
  excludedCategories: [],
  excludedProducts: [],
};

const CupponManage = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [editingCupponId, setEditingCupponId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [productSearch, setProductSearch] = useState("");

  const { data, isLoading, refetch } = useGetCupponsQuery({
    pageNumber: page,
    keyword,
    isActive: isActiveFilter,
  });

  const [createCuppon, { isLoading: isCreating }] = useCreateCupponMutation();
  const [updateCuppon, { isLoading: isUpdating }] = useUpdateCupponMutation();
  const [deleteCuppon] = useDeleteCupponMutation();
  const [toggleCupponStatus] = useToggleCupponStatusMutation();
  const [fetchStats, { data: statsData, isLoading: isStatsLoading }] = useLazyGetCupponStatsQuery();

  const { data: categoriesData } = useFetchCategoriesQuery();
  const { data: productsData } = useGetProductsQuery({ pageNumber: 1, keyword: productSearch });

  const categories = categoriesData?.categories || categoriesData || [];
  const products = productsData?.products || productsData || [];

  useEffect(() => { refetch(); }, [page, keyword, isActiveFilter, refetch]);

  const openAddModal = () => {
    setFormData(initialFormState);
    setEditingCupponId(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (cuppon) => {
    setEditingCupponId(cuppon._id);
    setFormData({
      code: cuppon.code,
      description: cuppon.description || "",
      discountType: cuppon.discountType,
      discountValue: cuppon.discountValue,
      minimumOrderAmount: cuppon.minimumOrderAmount || 0,
      maximumDiscountAmount: cuppon.maximumDiscountAmount || "",
      usageLimit: cuppon.usageLimit || "",
      perUserLimit: cuppon.perUserLimit || 1,
      isFirstTimeOnly: cuppon.isFirstTimeOnly,
      startDate: cuppon.startDate ? new Date(cuppon.startDate).toISOString().split("T")[0] : "",
      endDate: cuppon.endDate ? new Date(cuppon.endDate).toISOString().split("T")[0] : "",
      isActive: cuppon.isActive,
      applicableCategories: cuppon.applicableCategories?.map(String) || [],
      applicableProducts: cuppon.applicableProducts?.map(String) || [],
      excludedCategories: cuppon.excludedCategories?.map(String) || [],
      excludedProducts: cuppon.excludedProducts?.map(String) || [],
    });
    setIsFormModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleArrayChange = (name, value) => {
    setFormData((prev) => {
      const arr = prev[name];
      if (arr.includes(value)) {
        return { ...prev, [name]: arr.filter((id) => id !== value) };
      } else {
        return { ...prev, [name]: [...arr, value] };
      }
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await deleteCuppon(id).unwrap();
        toast.success("Coupon deleted successfully");
        refetch();
      } catch (err) {
        toast.error(err?.data?.error || "Failed to delete coupon");
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleCupponStatus(id).unwrap();
      toast.success("Coupon status updated");
      refetch();
    } catch (err) {
      toast.error(err?.data?.error || "Failed to toggle status");
    }
  };

  const handleViewStats = async (id) => {
    setIsStatsModalOpen(true);
    try {
      await fetchStats(id).unwrap();
    } catch (err) {
      toast.error("Failed to load stats");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.endDate) {
      return toast.error("Please fill in all required fields (Code, Value, End Date)");
    }

    const payload = {
      ...formData,
      minimumOrderAmount: Number(formData.minimumOrderAmount) || 0,
      maximumDiscountAmount: formData.maximumDiscountAmount ? Number(formData.maximumDiscountAmount) : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      perUserLimit: Number(formData.perUserLimit) || 1,
      discountValue: Number(formData.discountValue),
    };

    try {
      if (editingCupponId) {
        await updateCuppon({ cupponId: editingCupponId, updatedCuppon: payload }).unwrap();
        toast.success("Coupon updated successfully");
      } else {
        await createCuppon(payload).unwrap();
        toast.success("Coupon created successfully");
      }
      setIsFormModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.error || "Something went wrong");
    }
  };

  const submitBtnLoading = isCreating || isUpdating;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Reusable Styles
  const inputClass = "w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const labelClass = "text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-mono pt-10 pb-16 transition-all duration-500">
      <div className="flex flex-col 2xl:flex-row">
        <AdminMenu />
        <div className="flex-1 px-4">
          <div className="max-w-[1500px] mx-auto">
            
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-l-4 border-black pl-4 sm:pl-6 py-2 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tighter uppercase">
                  Coupon / <span className="text-red-600">Management</span>
                </h1>
                <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">
                  Create, edit, and track discount coupons
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="bg-black text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 rounded-sm w-full md:w-auto justify-center"
              >
                <FaPlus size={10} /> Create Coupon
              </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 mb-6 flex flex-col md:flex-row gap-3 items-center border border-gray-200 rounded-sm">
              <div className="relative flex-1 w-full">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
                <input
                  type="text"
                  placeholder="SEARCH BY CODE..."
                  className={`${inputClass} pl-9 uppercase`}
                  value={keyword}
                  onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                />
              </div>
              <select
                className={`${inputClass} md:w-1/4 cursor-pointer uppercase text-xs`}
                value={isActiveFilter}
                onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Status</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Loading coupons...</div>
            ) : data?.cuppons?.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs border border-dashed border-gray-200 rounded-sm">No coupons found. Create one!</div>
            ) : (
              <>
                {/* ============================================ */}
                {/* MOBILE VIEW: Card Layout (Visible < md) */}
                {/* ============================================ */}
                <div className="md:hidden space-y-4">
                  {data?.cuppons?.map((cuppon) => {
                    const isExpired = new Date() > new Date(cuppon.endDate);
                    return (
                      <div key={cuppon._id} className="border border-gray-200 p-4 rounded-sm bg-white hover:border-black transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-mono font-black text-black uppercase tracking-wider text-sm">{cuppon.code}</h3>
                            {cuppon.description && <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[200px]">{cuppon.description}</p>}
                          </div>
                          <button onClick={() => handleToggle(cuppon._id)} className={`text-2xl ${cuppon.isActive ? "text-black" : "text-gray-300"}`}>
                            {cuppon.isActive ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4 border-t border-b border-gray-100 py-3">
                          <div>
                            <span className="text-[8px] font-bold text-gray-400 uppercase block">Discount</span>
                            <span className="font-bold text-red-600 text-sm">
                              {cuppon.discountType === "percentage" ? `${cuppon.discountValue}%` : `৳${cuppon.discountValue}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-gray-400 uppercase block">Min Order</span>
                            <span className="font-bold text-black text-sm">৳{cuppon.minimumOrderAmount || 0}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-gray-400 uppercase block">Validity</span>
                            <span className="font-medium text-gray-700 text-[11px]">{formatDate(cuppon.startDate)} - {formatDate(cuppon.endDate)}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-gray-400 uppercase block">Status</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-sm font-bold uppercase ${isExpired ? "bg-red-100 text-red-700" : cuppon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                              {isExpired ? "Expired" : cuppon.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-[10px] text-gray-500">
                            Used: <span className="font-black text-black">{cuppon.usageCount}/{cuppon.usageLimit || "∞"}</span>
                          </div>
                          <div className="flex gap-3 items-center">
                            <button onClick={() => handleEdit(cuppon)} className="text-gray-400 hover:text-black transition-colors"><FaEdit size={14}/></button>
                            <button onClick={() => handleViewStats(cuppon._id)} className="text-gray-400 hover:text-black transition-colors"><FaChartBar size={14}/></button>
                            <button onClick={() => handleDelete(cuppon._id)} className="text-gray-400 hover:text-red-600 transition-colors"><FaTrash size={12}/></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ============================================ */}
                {/* DESKTOP VIEW: Table Layout (Visible >= md) */}
                {/* ============================================ */}
                <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Code</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Discount</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Limits</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Validity</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data?.cuppons?.map((cuppon) => {
                        const isExpired = new Date() > new Date(cuppon.endDate);
                        return (
                          <tr key={cuppon._id} className="hover:bg-gray-50 transition-colors group">
                            <td className="p-4">
                              <div className="font-mono font-black text-black uppercase tracking-wider bg-gray-100 px-2 py-1 inline-block text-xs border border-gray-200">
                                {cuppon.code}
                              </div>
                              {cuppon.description && <p className="text-[10px] text-gray-400 mt-1 w-40 truncate">{cuppon.description}</p>}
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-red-600 text-sm">
                                {cuppon.discountType === "percentage" ? `${cuppon.discountValue}%` : `৳${cuppon.discountValue}`}
                              </span>
                              {cuppon.maximumDiscountAmount && cuppon.discountType === "percentage" && (
                                <span className="text-[9px] text-gray-500 block">(Max: ৳{cuppon.maximumDiscountAmount})</span>
                              )}
                              <span className="text-[9px] text-gray-500 block">Min: ৳{cuppon.minimumOrderAmount || 0}</span>
                            </td>
                            <td className="p-4 text-xs text-gray-700">
                              <p>Total: <span className="font-bold text-black">{cuppon.usageCount}/{cuppon.usageLimit || "∞"}</span></p>
                              <p>User: <span className="font-bold text-black">{cuppon.perUserLimit}</span></p>
                              {cuppon.isFirstTimeOnly && <span className="text-[8px] bg-black text-white px-1.5 py-0.5 rounded-sm">New Users</span>}
                            </td>
                            <td className="p-4 text-[11px] text-gray-600">
                              <p>{formatDate(cuppon.startDate)}</p>
                              <p className="font-bold text-black">to {formatDate(cuppon.endDate)}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col items-start gap-2">
                                <button onClick={() => handleToggle(cuppon._id)} className={`text-xl ${cuppon.isActive ? "text-black" : "text-gray-300"}`}>
                                  {cuppon.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                </button>
                                <span className={`text-[8px] px-2 py-0.5 rounded-sm font-bold uppercase ${isExpired ? "bg-red-100 text-red-700" : cuppon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                  {isExpired ? "Expired" : cuppon.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-3 justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(cuppon)} className="text-gray-400 hover:text-black transition-colors" title="Edit"><FaEdit size={14}/></button>
                                <button onClick={() => handleViewStats(cuppon._id)} className="text-gray-400 hover:text-black transition-colors" title="Stats"><FaChartBar size={14}/></button>
                                <button onClick={() => handleDelete(cuppon._id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete"><FaTrash size={12}/></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Pagination */}
            {data?.totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2">
                {[...Array(data.totalPages).keys()].map((x) => (
                  <button
                    key={x + 1}
                    onClick={() => setPage(x + 1)}
                    className={`w-9 h-9 text-[11px] font-bold transition-all rounded-sm ${page === x + 1 ? "bg-black text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black"}`}
                  >
                    {x + 1}
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ============ CREATE / EDIT MODAL ============ */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start z-50 p-4 pt-10 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-sm w-full max-w-3xl mb-10">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-sm font-black text-black uppercase tracking-wider">{editingCupponId ? "Update Coupon" : "Create New Coupon"}</h2>
              <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-black transition-colors"><FaTimes size={16}/></button>
            </div>

            <form onSubmit={submitHandler} className="p-5 space-y-6">
              {/* Section 1: Basic Info */}
              <div className="border border-gray-200 rounded-sm p-4">
                <h3 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Coupon Code *</label>
                    <input type="text" name="code" value={formData.code} onChange={handleInputChange} className={`${inputClass} uppercase`} required />
                  </div>
                  <div>
                    <label className={labelClass}>Discount Type *</label>
                    <select name="discountType" value={formData.discountType} onChange={handleInputChange} className={`${inputClass} cursor-pointer`}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (৳)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Discount Value *</label>
                    <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} className={inputClass} min="0" required />
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelClass}>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className={inputClass} rows="2"></textarea>
                  </div>
                </div>
              </div>

              {/* Section 2: Limits & Conditions */}
              <div className="border border-gray-200 rounded-sm p-4">
                <h3 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Limits & Conditions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Min Order Amount (৳)</label>
                    <input type="number" name="minimumOrderAmount" value={formData.minimumOrderAmount} onChange={handleInputChange} className={inputClass} min="0" />
                  </div>
                  {formData.discountType === "percentage" && (
                    <div>
                      <label className={labelClass}>Max Discount Cap (৳)</label>
                      <input type="number" name="maximumDiscountAmount" value={formData.maximumDiscountAmount} onChange={handleInputChange} className={inputClass} min="0" placeholder="No limit" />
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>Total Usage Limit</label>
                    <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleInputChange} className={inputClass} min="1" placeholder="Unlimited" />
                  </div>
                  <div>
                    <label className={labelClass}>Per User Limit</label>
                    <input type="number" name="perUserLimit" value={formData.perUserLimit} onChange={handleInputChange} className={inputClass} min="1" />
                  </div>
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>End Date *</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className={inputClass} required />
                  </div>
                </div>
                <div className="flex gap-6 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="accent-black w-4 h-4" />
                    <span className="text-xs font-bold text-gray-700 uppercase">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isFirstTimeOnly" checked={formData.isFirstTimeOnly} onChange={handleInputChange} className="accent-black w-4 h-4" />
                    <span className="text-xs font-bold text-gray-700 uppercase">First Time Buyers Only</span>
                  </label>
                </div>
              </div>

              {/* Section 3: Restrictions */}
              <div className="border border-gray-200 rounded-sm p-4">
                <h3 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Restrictions (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Applicable Categories</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {categories.length === 0 ? <p className="text-[9px] text-gray-400 p-1">No categories</p> :
                        categories.map((cat) => (
                          <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-xs">
                            <input type="checkbox" checked={formData.applicableCategories.includes(cat._id)} onChange={() => handleArrayChange("applicableCategories", cat._id)} className="accent-black w-3 h-3" />
                            <span className="text-gray-700">{cat.name}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Excluded Categories</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {categories.length === 0 ? <p className="text-[9px] text-gray-400 p-1">No categories</p> :
                        categories.map((cat) => (
                          <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-xs">
                            <input type="checkbox" checked={formData.excludedCategories.includes(cat._id)} onChange={() => handleArrayChange("excludedCategories", cat._id)} className="accent-red-600 w-3 h-3" />
                            <span className="text-gray-700">{cat.name}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Applicable Products</label>
                    <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className={`${inputClass} mb-1 text-xs`} />
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {products.length === 0 ? <p className="text-[9px] text-gray-400 p-1">No products</p> :
                        products.map((prod) => (
                          <label key={prod._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-xs">
                            <input type="checkbox" checked={formData.applicableProducts.includes(prod._id)} onChange={() => handleArrayChange("applicableProducts", prod._id)} className="accent-black w-3 h-3" />
                            <span className="text-gray-700 truncate">{prod.name}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Excluded Products</label>
                    <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className={`${inputClass} mb-1 text-xs`} />
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {products.length === 0 ? <p className="text-[9px] text-gray-400 p-1">No products</p> :
                        products.map((prod) => (
                          <label key={prod._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-xs">
                            <input type="checkbox" checked={formData.excludedProducts.includes(prod._id)} onChange={() => handleArrayChange("excludedProducts", prod._id)} className="accent-red-600 w-3 h-3" />
                            <span className="text-gray-700 truncate">{prod.name}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitBtnLoading}
                  className="w-full bg-black text-white py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-red-600 disabled:bg-gray-400 transition-all flex justify-center items-center gap-2"
                >
                  {submitBtnLoading ? "Processing..." : editingCupponId ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ STATS MODAL ============ */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-sm w-full max-w-lg">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-sm font-black text-black uppercase tracking-wider">Coupon Stats</h2>
              <button onClick={() => setIsStatsModalOpen(false)} className="text-gray-400 hover:text-black transition-colors"><FaTimes size={16}/></button>
            </div>
            <div className="p-5">
              {isStatsLoading ? (
                <div className="text-center py-8 text-gray-400 text-xs uppercase font-bold">Loading stats...</div>
              ) : statsData ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-sm border border-gray-200">
                    <h3 className="font-black text-black uppercase tracking-wider text-sm mb-3">
                      Code: {statsData.cuppon.code}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-500 uppercase font-bold">Usage Count</p>
                        <p className="font-black text-black text-lg">{statsData.cuppon.usageCount} / {statsData.cuppon.usageLimit || "∞"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase font-bold">Total Orders</p>
                        <p className="font-black text-black text-lg">{statsData.ordersCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-sm border border-red-200">
                    <p className="text-[9px] text-red-600 uppercase font-bold">Total Discount Given</p>
                    <p className="font-black text-red-800 text-xl">৳{statsData.totalDiscountGiven}</p>
                  </div>
                  {statsData.recentOrders.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-3 text-black uppercase text-[10px] tracking-wider">Recent Orders</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {statsData.recentOrders.map((order) => (
                          <div key={order._id} className="text-xs bg-gray-50 p-3 rounded-sm border border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-black">#{order.orderId}</span>
                            <span className="text-red-600 font-bold">-৳{order.appliedCuppon?.discountAmount || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-xs uppercase font-bold">No stats available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CupponManage;