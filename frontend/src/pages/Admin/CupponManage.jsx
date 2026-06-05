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
// আপনার প্রজেক্টের সঠিক path থেকে import করুন
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice"; 
import { useGetProductsQuery } from "@redux/api/productApiSlice"; 

// Initial empty form state (All fields of cupponModel included)
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
  // States for filters & pagination
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");

  // States for Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [editingCupponId, setEditingCupponId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [productSearch, setProductSearch] = useState("");

  // RTK Query Hooks for Coupons
  const { data, isLoading, refetch } = useGetCupponsQuery({
    pageNumber: page,
    keyword,
    isActive: isActiveFilter,
  });

  const [createCuppon, { isLoading: isCreating }] = useCreateCupponMutation();
  const [updateCuppon, { isLoading: isUpdating }] = useUpdateCupponMutation();
  const [deleteCuppon] = useDeleteCupponMutation();
  const [toggleCupponStatus] = useToggleCupponStatusMutation();
  const [fetchStats, { data: statsData, isLoading: isStatsLoading }] =
    useLazyGetCupponStatsQuery();

  // RTK Query Hooks for Categories & Products dropdown
  const { data: categoriesData } = useFetchCategoriesQuery();
  const { data: productsData } = useGetProductsQuery({ pageNumber: 1, keyword: productSearch });

  const categories = categoriesData?.categories || categoriesData || [];
  const products = productsData?.products || productsData || [];

  useEffect(() => {
    refetch();
  }, [page, keyword, isActiveFilter, refetch]);

  // Open Modal for Create
  const openAddModal = () => {
    setFormData(initialFormState);
    setEditingCupponId(null);
    setIsFormModalOpen(true);
  };

  // Open Modal for Edit
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

  // Handle Array Fields (Categories/Products)
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

  // Date Formatter Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg mb-8 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <FaTag size={28} />
          <div>
            <h1 className="text-2xl font-bold">Manage Coupons</h1>
            <p className="text-sm text-blue-200">Create, edit, and track your discount coupons</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="bg-white text-blue-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2 shadow-md"
        >
          <FaPlus /> Create Coupon
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center border border-gray-100">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by code..."
            className="border border-gray-200 pl-10 pr-3 py-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="border border-gray-200 px-4 py-2.5 rounded-lg w-full md:w-1/4 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          value={isActiveFilter}
          onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 font-medium">Loading coupons...</div>
        ) : data?.cuppons?.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">No coupons found. Create one!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold">Code</th>
                  <th className="p-4 font-semibold">Discount</th>
                  <th className="p-4 font-semibold">Limits</th>
                  <th className="p-4 font-semibold">Validity</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.cuppons?.map((cuppon) => {
                  const isExpired = new Date() > new Date(cuppon.endDate);
                  return (
                    <tr key={cuppon._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <div className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                          {cuppon.code}
                        </div>
                        {cuppon.description && <p className="text-xs text-gray-500 mt-1 w-40 truncate">{cuppon.description}</p>}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-indigo-600">
                          {cuppon.discountType === "percentage" ? `${cuppon.discountValue}%` : `৳${cuppon.discountValue}`}
                        </span>
                        {cuppon.maximumDiscountAmount && cuppon.discountType === "percentage" && (
                          <span className="text-xs text-gray-500 block">(Max: ৳{cuppon.maximumDiscountAmount})</span>
                        )}
                        <span className="text-xs text-gray-500 block">Min: ৳{cuppon.minimumOrderAmount || 0}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        <p>Total: <span className="font-medium">{cuppon.usageCount}/{cuppon.usageLimit || "∞"}</span></p>
                        <p>User: <span className="font-medium">{cuppon.perUserLimit}</span></p>
                        {cuppon.isFirstTimeOnly && <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">New Users</span>}
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        <p>{formatDate(cuppon.startDate)}</p>
                        <p className="font-medium">to {formatDate(cuppon.endDate)}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-start gap-2">
                          <button onClick={() => handleToggle(cuppon._id)} className={`text-2xl ${cuppon.isActive ? "text-green-500" : "text-gray-300"}`}>
                            {cuppon.isActive ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${isExpired ? "bg-red-100 text-red-700" : cuppon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                            {isExpired ? "Expired" : cuppon.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-3 justify-end items-center">
                          <button onClick={() => handleEdit(cuppon)} className="text-blue-500 hover:text-blue-700 transition" title="Edit"><FaEdit size={18}/></button>
                          <button onClick={() => handleDelete(cuppon._id)} className="text-red-400 hover:text-red-600 transition" title="Delete"><FaTrash size={16}/></button>
                          <button onClick={() => handleViewStats(cuppon._id)} className="text-purple-500 hover:text-purple-700 transition" title="Stats"><FaChartBar size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-2">
          {[...Array(data.totalPages).keys()].map((x) => (
            <button
              key={x + 1}
              onClick={() => setPage(x + 1)}
              className={`w-10 h-10 rounded-lg font-medium transition ${page === x + 1 ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 border hover:bg-gray-50"}`}
            >
              {x + 1}
            </button>
          ))}
        </div>
      )}

      {/* ============ CREATE / EDIT MODAL ============ */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start z-50 p-4 pt-10 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mb-10">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800">{editingCupponId ? "Update Coupon" : "Create New Coupon"}</h2>
              <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-gray-800 transition"><FaTimes size={20}/></button>
            </div>

            <form onSubmit={submitHandler} className="p-6 space-y-6">
              {/* Section 1: Basic Info */}
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Coupon Code <span className="text-red-500">*</span></label>
                    <input type="text" name="code" value={formData.code} onChange={handleInputChange} className="w-full border-gray-200 bg-white px-3 py-2.5 rounded-lg uppercase focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Discount Type <span className="text-red-500">*</span></label>
                    <select name="discountType" value={formData.discountType} onChange={handleInputChange} className="w-full border-gray-200 bg-white px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (৳)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Discount Value <span className="text-red-500">*</span></label>
                    <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} className="w-full border-gray-200 bg-white px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="0" required />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-1 text-gray-600">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border-gray-200 bg-white px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="2"></textarea>
                  </div>
                </div>
              </div>

              {/* Section 2: Limits & Conditions */}
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Limits & Conditions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Min Order Amount (৳)</label>
                    <input type="number" name="minimumOrderAmount" value={formData.minimumOrderAmount} onChange={handleInputChange} className="w-full border-gray-200 bg-white px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="0" />
                  </div>
                  {formData.discountType === "percentage" && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-600">Max Discount Cap (৳)</label>
                      <input type="number" name="maximumDiscountAmount" value={formData.maximumDiscountAmount} onChange={handleInputChange} className="w-full border-gray-200 bg-white px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="0" placeholder="No limit" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Total Usage Limit</label>
                    <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleInputChange} className="w-full border-gray-200 bg-white px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="1" placeholder="Unlimited" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Per User Limit</label>
                    <input type="number" name="perUserLimit" value={formData.perUserLimit} onChange={handleInputChange} className="w-full border-gray-200 bg-white px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full border-gray-200 bg-white px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">End Date <span className="text-red-500">*</span></label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full border-gray-200 bg-white px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                </div>
                <div className="flex gap-6 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isFirstTimeOnly" checked={formData.isFirstTimeOnly} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm font-medium text-gray-700">First Time Buyers Only</span>
                  </label>
                </div>
              </div>

              {/* Section 3: Product/Category Restrictions (New) */}
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Restrictions (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Applicable Categories */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Applicable Categories</label>
                    <div className="max-h-40 overflow-y-auto border bg-white rounded-lg p-2 space-y-1">
                      {categories.length === 0 ? <p className="text-xs text-gray-400 p-1">No categories found</p> :
                        categories.map((cat) => (
                          <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input type="checkbox" checked={formData.applicableCategories.includes(cat._id)} onChange={() => handleArrayChange("applicableCategories", cat._id)} className="w-4 h-4 text-blue-600 rounded" />
                            <span className="text-sm text-gray-700">{cat.name}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>

                  {/* Excluded Categories */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Excluded Categories</label>
                    <div className="max-h-40 overflow-y-auto border bg-white rounded-lg p-2 space-y-1">
                      {categories.length === 0 ? <p className="text-xs text-gray-400 p-1">No categories found</p> :
                        categories.map((cat) => (
                          <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input type="checkbox" checked={formData.excludedCategories.includes(cat._id)} onChange={() => handleArrayChange("excludedCategories", cat._id)} className="w-4 h-4 text-red-600 rounded" />
                            <span className="text-sm text-gray-700">{cat.name}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>

                  {/* Applicable Products */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Applicable Products</label>
                    <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="w-full border-gray-200 bg-white px-3 py-2 rounded-lg mb-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    <div className="max-h-40 overflow-y-auto border bg-white rounded-lg p-2 space-y-1">
                      {products.length === 0 ? <p className="text-xs text-gray-400 p-1">No products found</p> :
                        products.map((prod) => (
                          <label key={prod._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input type="checkbox" checked={formData.applicableProducts.includes(prod._id)} onChange={() => handleArrayChange("applicableProducts", prod._id)} className="w-4 h-4 text-blue-600 rounded" />
                            <span className="text-sm text-gray-700 truncate">{prod.name}</span>
                          </label>
                        ))
                      }
                    </div>
                  </div>

                  {/* Excluded Products */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Excluded Products</label>
                    <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="w-full border-gray-200 bg-white px-3 py-2 rounded-lg mb-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    <div className="max-h-40 overflow-y-auto border bg-white rounded-lg p-2 space-y-1">
                      {products.length === 0 ? <p className="text-xs text-gray-400 p-1">No products found</p> :
                        products.map((prod) => (
                          <label key={prod._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input type="checkbox" checked={formData.excludedProducts.includes(prod._id)} onChange={() => handleArrayChange("excludedProducts", prod._id)} className="w-4 h-4 text-red-600 rounded" />
                            <span className="text-sm text-gray-700 truncate">{prod.name}</span>
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
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition flex justify-center items-center gap-2 shadow-md"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800">Coupon Usage Stats</h2>
              <button onClick={() => setIsStatsModalOpen(false)} className="text-gray-400 hover:text-gray-800 transition"><FaTimes size={20}/></button>
            </div>
            <div className="p-6">
              {isStatsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading stats...</div>
              ) : statsData ? (
                <div className="space-y-5">
                  <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                    <h3 className="font-bold text-indigo-900 text-lg mb-3">
                      Code: {statsData.cuppon.code}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-indigo-600">Usage Count</p>
                        <p className="font-bold text-indigo-900 text-lg">{statsData.cuppon.usageCount} / {statsData.cuppon.usageLimit || "∞"}</p>
                      </div>
                      <div>
                        <p className="text-indigo-600">Total Orders</p>
                        <p className="font-bold text-indigo-900 text-lg">{statsData.ordersCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <p className="text-sm text-red-600">Total Discount Given</p>
                    <p className="font-bold text-red-800 text-xl">৳{statsData.totalDiscountGiven}</p>
                  </div>
                  {statsData.recentOrders.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-800">Recent Orders</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {statsData.recentOrders.map((order) => (
                          <div key={order._id} className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                            <span className="font-medium text-gray-900">#{order.orderId}</span>
                            <span className="text-red-600 font-semibold">-৳{order.appliedCuppon?.discountAmount || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No stats available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CupponManage;