import { useState, } from "react";
import {
  useGetAllCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useToggleCampaignStatusMutation,
  useUploadCampaignBannerMutation,
} from "@redux/api/campaignApiSlice";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { useAllProductsQuery } from "@redux/api/productApiSlice";
import {
  FaPlus,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaCalendar,
  FaTag,
  FaCloudArrowUp,
} from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";
import { FaRegEdit } from "react-icons/fa";

const initialFormData = {
  title: "",
  description: "",
  bannerImage: "",
  type: "flash_sale",
  discountType: "percentage",
  discountValue: "",
  scope: "all",
  applicableCategories: [],
  applicableProducts: [],
  excludedProducts: [],
  maxDiscountAmount: "",
  minPurchaseAmount: "",
  startDate: "",
  endDate: "",
  priority: 0,
  isStackable: false,
  usageLimit: "",
  usagePerUser: 1,
};

const CampaignManage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [modalType, setModalType] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  
  // Image states
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { data: campaignRes, isLoading, refetch } = useGetAllCampaignsQuery(
    activeTab === "all" ? "" : { status: activeTab }
  );

 
  const campaigns = campaignRes?.data || [];
  
  const { data: categories } = useFetchCategoriesQuery();
  const { data: products } = useAllProductsQuery();

  const [createCampaign, { isLoading: isCreating }] =
    useCreateCampaignMutation();
  const [updateCampaign, { isLoading: isUpdating }] =
    useUpdateCampaignMutation();
  const [deleteCampaign, { isLoading: isDeleting }] =
    useDeleteCampaignMutation();
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleCampaignStatusMutation();
  const [uploadBanner, { isLoading: isUploading }] =
    useUploadCampaignBannerMutation();

  const tabs = ["all", "active", "upcoming", "expired", "disabled"];

  const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const openModal = (campaign, type) => {
    if (type === "edit" && campaign) {
      setFormData({
        ...campaign,
        startDate: formatDateTimeLocal(campaign.startDate),
        endDate: formatDateTimeLocal(campaign.endDate),
        maxDiscountAmount: campaign.maxDiscountAmount || "",
        usageLimit: campaign.usageLimit || "",
      });
      setImagePreview(campaign.bannerImage || null);
      setSelectedCampaign(campaign);
    } else {
      setFormData(initialFormData);
      setImagePreview(null);
      setSelectedCampaign(null);
    }
    setSelectedFile(null);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedCampaign(null);
    setFormData(initialFormData);
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayToggle = (id, field) => {
    setFormData((prev) => {
      const currentArray = prev[field] || [];
      return {
        ...prev,
        [field]: currentArray.includes(id)
          ? currentArray.filter((itemId) => itemId !== id)
          : [...currentArray, id],
      };
    });
  };

  // Image Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return toast.error("Please select an image first");
    try {
      const formDataCloud = new FormData();
      formDataCloud.append("image", selectedFile);
      const res = await uploadBanner(formDataCloud).unwrap();
      setFormData((prev) => ({ ...prev, bannerImage: res.url }));
      toast.success("Banner uploaded to cloud!");
    } catch (err) {
      toast.error(err?.data?.message || "Image upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bannerImage) {
      return toast.error("Campaign banner image is required");
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return toast.error("End date must be after start date");
    }

    try {
      const payload = {
        ...formData,
        maxDiscountAmount: formData.maxDiscountAmount
          ? Number(formData.maxDiscountAmount)
          : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        discountValue: Number(formData.discountValue),
        minPurchaseAmount: Number(formData.minPurchaseAmount) || 0,
        priority: Number(formData.priority) || 0,
        usagePerUser: Number(formData.usagePerUser) || 1,
      };

      if (modalType === "create") {
        await createCampaign(payload).unwrap();
        toast.success("Campaign created successfully");
      } else if (modalType === "edit") {
        await updateCampaign({ id: selectedCampaign._id, data: payload }).unwrap();
        toast.success("Campaign updated successfully");
      }
      closeModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        await deleteCampaign(id).unwrap();
        toast.success("Campaign deleted");
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete");
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleStatus(id).unwrap();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to toggle status");
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      case "expired":
        return "bg-gray-100 text-gray-700";
      case "disabled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen font-sans text-sm">
      <AdminMenu />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div className="border-l-4 border-black pl-6">
            <h1 className="text-2xl font-bold text-black uppercase tracking-tight">
              Campaign / <span className="text-red-600">Management</span>
            </h1>
          </div>
          <button
            onClick={() => openModal(null, "create")}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white font-medium hover:bg-red-600 transition-colors uppercase tracking-wider text-sm"
          >
            <FaPlus size={12} /> Create Campaign
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wider border transition-colors rounded-sm ${
                activeTab === tab
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-200 hover:border-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Campaigns List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-sm"></div>
            ))}
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="space-y-4">
            {campaigns.map((camp) => (
              <div
                key={camp._id}
                className="bg-white border border-gray-200 p-6 hover:border-gray-400 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Info Section */}
                  <div className="lg:col-span-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-black">
                        {camp.title}
                      </h3>
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <span
                          className={`px-3 py-1 text-xs font-semibold uppercase rounded-sm ${getStatusBadgeClasses(camp.status)}`}
                        >
                          {camp.status}
                        </span>
                        <span className="px-3 py-1 text-xs font-semibold uppercase rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {camp.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600 border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Discount</p>
                        <p className="font-medium text-black">
                          {camp.discountType === "percentage"
                            ? `${camp.discountValue}%`
                            : `৳${camp.discountValue}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Scope</p>
                        <p className="font-medium text-black capitalize">{camp.scope}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Schedule</p>
                        <p className="font-medium text-black flex items-center gap-1">
                          <FaCalendar size={10} />
                          {new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Usage</p>
                        <p className="font-medium text-black">
                          {camp.usedCount} / {camp.usageLimit || "∞"}
                        </p>
                      </div>
                    </div>
                    
                    {camp.minPurchaseAmount > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        * Min purchase: ৳{camp.minPurchaseAmount}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons Section */}
                  <div className="flex flex-row lg:flex-col gap-2 items-start lg:items-end justify-end">
                    <button
                      onClick={() => handleToggle(camp._id)}
                      disabled={isToggling}
                      className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:border-black hover:text-black transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {camp.status === "disabled" ? <FaToggleOff size={16} /> : <FaToggleOn size={16} className="text-green-600" />}
                      {camp.status === "disabled" ? "Enable" : "Disable"}
                    </button>
                    <button
                      onClick={() => openModal(camp, "edit")}
                      className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-colors text-sm font-medium"
                    >
                      <FaRegEdit size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(camp._id)}
                      disabled={isDeleting}
                      className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <FaTrash size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-12 text-center text-gray-500 font-medium">
            No campaigns found in this category.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalType && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl my-10 p-8 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-black mb-6 uppercase">
                {modalType === "create" ? "Create New" : "Edit"} Campaign
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1: Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 uppercase mb-1">
                      Campaign Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none"
                      placeholder="e.g., Winter Flash Sale"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none resize-none"
                    />
                  </div>
                  
                  {/* Image Upload Section */}
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 uppercase mb-1">
                      Campaign Banner Image *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="w-full sm:w-48 h-32 border-2 border-dashed border-gray-300 rounded-sm flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Banner Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaCloudArrowUp className="text-3xl text-gray-300" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChange}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-medium file:bg-black file:text-white hover:file:bg-red-600 file:cursor-pointer file:transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleUpload}
                          disabled={isUploading || !selectedFile}
                          className="w-full py-2 border border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploading ? "Uploading to Cloud..." : "Upload to Cloud"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Discount & Type Config */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-bold text-black mb-4 uppercase flex items-center gap-2">
                    <FaTag size={12} /> Discount Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Type</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none bg-white">
                        <option value="flash_sale">Flash Sale</option>
                        <option value="seasonal">Seasonal</option>
                        <option value="clearance">Clearance</option>
                        <option value="category_sale">Category Sale</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Discount Type</label>
                      <select name="discountType" value={formData.discountType} onChange={handleInputChange} className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none bg-white">
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (৳)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Discount Value *</label>
                      <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} required min="0" className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Max Discount (৳)</label>
                      <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleInputChange} min="0" className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" placeholder="Optional" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Min Purchase (৳)</label>
                      <input type="number" name="minPurchaseAmount" value={formData.minPurchaseAmount} onChange={handleInputChange} min="0" className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="isStackable" checked={formData.isStackable} onChange={handleInputChange} className="w-4 h-4 accent-black" />
                        <span className="text-sm text-gray-700">Is Stackable?</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Row 3: Scope Configuration */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-bold text-black mb-4 uppercase">Scope & Applicability</h3>
                  <div className="mb-4 w-1/3">
                    <label className="block text-xs text-gray-500 uppercase mb-1">Scope</label>
                    <select name="scope" value={formData.scope} onChange={handleInputChange} className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none bg-white">
                      <option value="all">All Products</option>
                      <option value="category">Specific Categories</option>
                      <option value="product">Specific Products</option>
                    </select>
                  </div>

                  {formData.scope === "category" && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase mb-2">Select Categories:</p>
                      <div className="max-h-40 overflow-y-auto border border-gray-200 p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50">
                        {categories?.map((cat) => (
                          <label key={cat._id} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={formData.applicableCategories.includes(cat._id)}
                              onChange={() => handleArrayToggle(cat._id, "applicableCategories")}
                              className="w-3.5 h-3.5 accent-black"
                            />
                            {cat.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.scope === "product" && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase mb-2">Select Products:</p>
                      <div className="max-h-40 overflow-y-auto border border-gray-200 p-3 space-y-2 bg-gray-50">
                        {products?.map((prod) => (
                          <label key={prod._id} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={formData.applicableProducts.includes(prod._id)}
                              onChange={() => handleArrayToggle(prod._id, "applicableProducts")}
                              className="w-3.5 h-3.5 accent-black"
                            />
                            {prod.name} <span className="text-gray-400">(৳{prod.price})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.scope === "category" && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-2">Excluded Products (Optional):</p>
                      <div className="max-h-40 overflow-y-auto border border-gray-200 p-3 space-y-2 bg-gray-50">
                        {products?.map((prod) => (
                          <label key={prod._id} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={formData.excludedProducts.includes(prod._id)}
                              onChange={() => handleArrayToggle(prod._id, "excludedProducts")}
                              className="w-3.5 h-3.5 accent-black"
                            />
                            {prod.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 4: Schedule & Limits */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-bold text-black mb-4 uppercase flex items-center gap-2">
                    <FaCalendar size={12} /> Schedule & Limits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Start Date *</label>
                      <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} required className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">End Date *</label>
                      <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleInputChange} required className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Priority</label>
                      <input type="number" name="priority" value={formData.priority} onChange={handleInputChange} min="0" className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Total Usage Limit</label>
                      <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleInputChange} min="0" className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" placeholder="Empty = Unlimited" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Per User Limit</label>
                      <input type="number" name="usagePerUser" value={formData.usagePerUser} onChange={handleInputChange} min="1" className="w-full border border-gray-300 p-3 text-sm focus:border-black outline-none" />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium hover:border-black transition-colors uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="flex-1 py-3 bg-black text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 uppercase tracking-wider"
                  >
                    {isCreating || isUpdating ? "Saving..." : modalType === "create" ? "Create Campaign" : "Update Campaign"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignManage;