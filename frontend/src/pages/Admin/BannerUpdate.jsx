/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminMenu from "./AdminMenu";
import {
  useGetBannerByIdQuery,
  useUpdateBannerMutation,
} from "@redux/api/bannerApiSlice";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { useGetProductsQuery } from "@redux/api/productApiSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { UPLOAD_URL } from "../../redux/constants";
import {
  FaSave,
  FaCloudUploadAlt,
  FaTrash,
  FaArrowLeft,
  FaImage,
  FaMobileAlt,
  FaTag,
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
      Loading Data...
    </p>
  </div>
);

const BannerUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: banner, isLoading: isFetching } = useGetBannerByIdQuery(id);
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const { data: categories } = useFetchCategoriesQuery();
  const { data: products } = useGetProductsQuery({});

  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(null);

  const buttonTypeOptions = [
    { value: "default", label: "Default (Shop Now)", icon: "🛒" },
    { value: "weekend-deal", label: "Weekend Deal", icon: "🔥" },
    { value: "flash-sale", label: "Flash Sale", icon: "⚡" },
    { value: "big-sale", label: "Big Sale", icon: "💥" },
    { value: "limited-offer", label: "Limited Offer", icon: "⏰" },
    { value: "special-offer", label: "Special Offer", icon: "🎁" },
    { value: "clearance", label: "Clearance", icon: "🏷️" },
    { value: "new-arrival", label: "New Arrival", icon: "✨" },
    { value: "best-seller", label: "Best Seller", icon: "⭐" },
    { value: "trending-now", label: "Trending Now", icon: "📈" },
    { value: "hot-deal", label: "Hot Deal", icon: "🌶️" },
    { value: "mega-sale", label: "Mega Sale", icon: "🎉" },
    { value: "seasonal-offer", label: "Seasonal Offer", icon: "🌸" },
    { value: "exclusive", label: "Exclusive", icon: "💎" },
    { value: "last-chance", label: "Last Chance", icon: "⚠️" },
    { value: "doorbuster", label: "Doorbuster", icon: "🚪" },
    { value: "early-bird", label: "Early Bird", icon: "🐦" },
    { value: "member-exclusive", label: "Member Exclusive", icon: "👤" },
    { value: "bundle-deal", label: "Bundle Deal", icon: "📦" },
    { value: "buy-one-get-one", label: "Buy 1 Get 1", icon: "🎊" },
  ];

  useEffect(() => {
    if (banner) {
      setFormData({
        name: banner.name || "",
        type: banner.type || "hero",
        headline: banner.headline || "",
        subHeadline: banner.subHeadline || "",
        image: banner.image || "",
        mobileImage: banner.mobileImage || "",
        buttonText: banner.buttonText || "Shop Now",
        buttonType: banner.buttonType || "default",
        link: banner.link || "",
        product: banner.product?._id || "",
        category: banner.category?._id || "",
        position: banner.position || 1,
        backgroundColor: banner.backgroundColor || "#ffffff",
        textColor: banner.textColor || "#000000",
        buttonColor: banner.buttonColor || "#000000",
        buttonTextColor: banner.buttonTextColor || "#ffffff",
        startDate: banner.startDate
          ? new Date(banner.startDate).toISOString().slice(0, 16)
          : "",
        endDate: banner.endDate
          ? new Date(banner.endDate).toISOString().slice(0, 16)
          : "",
        isActive: banner.isActive ?? true,
        displayPages: banner.displayPages || ["home"],
        displayOn: banner.displayOn || {
          desktop: true,
          mobile: true,
          tablet: true,
        },
        popupSettings: banner.popupSettings || {
          delay: 5,
          showAgainAfter: 24,
          couponCode: "",
          discountAmount: 0,
        },
        offerSettings: banner.offerSettings || {
          offerType: "percentage",
          offerValue: 0,
          isLimitedTime: false,
          countdownEndTime: "",
        },
      });
    }
  }, [banner]);

  const bannerTypes = [
    { value: "hero", label: "Hero Banner" },
    { value: "category", label: "Category Banner" },
    { value: "promotional", label: "Promotional" },
    { value: "sidebar", label: "Sidebar" },
    { value: "popup", label: "Popup" },
    { value: "footer", label: "Footer" },
    { value: "top-bar", label: "Top Bar" },
    { value: "middle", label: "Middle" },
  ];

  const displayPageOptions = [
    { value: "home", label: "Homepage" },
    { value: "category", label: "Category" },
    { value: "product", label: "Product" },
    { value: "cart", label: "Cart" },
    { value: "checkout", label: "Checkout" },
    { value: "all", label: "All Pages" },
  ];

  const getButtonTypeStyle = (type) =>
    buttonTypeOptions.find((opt) => opt.value === type) || buttonTypeOptions[0];

  const handleImageUpload = async (e, isMobile = false) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      const { data } = await axios.post(
        `${UPLOAD_URL}/banner`,
        uploadFormData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setFormData((prev) => ({
        ...prev,
        [isMobile ? "mobileImage" : "image"]: data.image,
      }));
      toast.success(`${isMobile ? "Mobile" : "Desktop"} image uploaded!`);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateBanner({ bannerId: id, bannerData: formData }).unwrap();
      toast.success("Banner updated successfully!");
      navigate("/admin/bannerlist");
    } catch (error) {
      toast.error(error.data?.error || "Failed to update banner");
    }
  };

  const handleDisplayPageChange = (page) => {
    setFormData((prev) => {
      const current = prev.displayPages;
      if (current.includes(page))
        return { ...prev, displayPages: current.filter((p) => p !== page) };
      return { ...prev, displayPages: [...current, page] };
    });
  };

  if (isFetching || !formData) return <LoadingSpinner />;

  // Reusable Styles
  const inputClass =
    "w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass =
    "text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-mono pt-20 lg:pt-28 pb-16 transition-all duration-500">
      <div className="flex flex-col 2xl:flex-row">
        <AdminMenu />
        <div className="flex-1 px-4 sm:px-6 lg:px-12">
          <div className="max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-l-4 border-black pl-4 sm:pl-6 py-2 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tighter uppercase">
                  Update / <span className="text-red-600">Banner</span>
                </h1>
                <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">
                  ID: {id}
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/bannerlist")}
                className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <FaArrowLeft size={10} /> Back to List
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Left Column: Images & Basic Info */}
                <div className="space-y-6">
                  {/* Images */}
                  <div className="border border-gray-200 p-4 sm:p-5 rounded-sm bg-white">
                    <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                      <FaImage size={12} /> Assets
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Desktop */}
                      <div>
                        <label className={labelClass}>Desktop</label>
                        {formData.image ? (
                          <div className="relative group border border-gray-200 rounded-sm overflow-hidden">
                            <img
                              src={formData.image}
                              alt="Desktop"
                              className="w-full h-28 sm:h-36 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, image: "" }))
                              }
                              className="absolute top-1 right-1 bg-black text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTrash size={9} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-28 sm:h-36 border border-dashed border-gray-300 rounded-sm cursor-pointer hover:border-black transition-colors bg-gray-50">
                            <FaCloudUploadAlt className="text-xl text-gray-400 group-hover:text-black" />
                            <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">
                              Upload
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, false)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      {/* Mobile */}
                      <div>
                        <label className={labelClass}>Mobile</label>
                        {formData.mobileImage ? (
                          <div className="relative group border border-gray-200 rounded-sm overflow-hidden">
                            <img
                              src={formData.mobileImage}
                              alt="Mobile"
                              className="w-full h-28 sm:h-36 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  mobileImage: "",
                                }))
                              }
                              className="absolute top-1 right-1 bg-black text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTrash size={9} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-28 sm:h-36 border border-dashed border-gray-300 rounded-sm cursor-pointer hover:border-black transition-colors bg-gray-50">
                            <FaMobileAlt className="text-xl text-gray-400" />
                            <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">
                              Upload
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, true)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="border border-gray-200 p-4 sm:p-5 rounded-sm bg-white">
                    <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      Basic Info
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Type</label>
                          <select
                            value={formData.type}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                type: e.target.value,
                              }))
                            }
                            className={selectClass}
                          >
                            {bannerTypes.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Headline</label>
                        <input
                          type="text"
                          value={formData.headline}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              headline: e.target.value,
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Sub Headline</label>
                        <input
                          type="text"
                          value={formData.subHeadline}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              subHeadline: e.target.value,
                            }))
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          className={`${labelClass} flex items-center gap-1`}
                        >
                          <FaTag size={9} /> Button Type
                        </label>
                        <select
                          value={formData.buttonType}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              buttonType: e.target.value,
                            }))
                          }
                          className={selectClass}
                        >
                          {buttonTypeOptions.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                        <div className="mt-2">
                          <span className="inline-block bg-black text-white px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase">
                            {getButtonTypeStyle(formData.buttonType).icon}{" "}
                            {getButtonTypeStyle(formData.buttonType).label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="border border-gray-200 p-4 sm:p-5 rounded-sm bg-white">
                    <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      Theme Colors
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { key: "backgroundColor", label: "Background" },
                        { key: "textColor", label: "Text" },
                        { key: "buttonColor", label: "Button" },
                        { key: "buttonTextColor", label: "Btn Text" },
                      ].map((c) => (
                        <div key={c.key} className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData[c.key]}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                [c.key]: e.target.value,
                              }))
                            }
                            className="w-8 h-8 border border-gray-200 rounded-sm cursor-pointer p-0.5"
                          />
                          <span className="text-[9px] font-bold text-gray-600 uppercase">
                            {c.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Settings */}
                <div className="space-y-6">
                  {/* Links */}
                  <div className="border border-gray-200 p-4 sm:p-5 rounded-sm bg-white">
                    <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      Links & Reference
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Button Text</label>
                          <input
                            type="text"
                            value={formData.buttonText}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                buttonText: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Position</label>
                          <input
                            type="number"
                            value={formData.position}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                position: parseInt(e.target.value),
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>URL</label>
                        <input
                          type="text"
                          value={formData.link}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              link: e.target.value,
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Product</label>
                        <select
                          value={formData.product}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              product: e.target.value,
                            }))
                          }
                          className={selectClass}
                        >
                          <option value="">None</option>
                          {products?.products?.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              category: e.target.value,
                            }))
                          }
                          className={selectClass}
                        >
                          <option value="">None</option>
                          {categories?.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="border border-gray-200 p-4 sm:p-5 rounded-sm bg-white">
                    <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      Schedule
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Start Date</label>
                          <input
                            type="datetime-local"
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                startDate: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>End Date</label>
                          <input
                            type="datetime-local"
                            value={formData.endDate}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                endDate: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              isActive: e.target.checked,
                            }))
                          }
                          className="accent-black w-4 h-4"
                        />
                        <span className="text-xs font-bold text-gray-700 uppercase">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Display Settings */}
                  <div className="border border-gray-200 p-4 sm:p-5 rounded-sm bg-white">
                    <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      Display Pages
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {displayPageOptions.map((page) => (
                        <label
                          key={page.value}
                          className={`px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${formData.displayPages.includes(page.value) ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-black"}`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.displayPages.includes(page.value)}
                            onChange={() => handleDisplayPageChange(page.value)}
                            className="hidden"
                          />
                          {page.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Popup Settings */}
                  {formData.type === "popup" && (
                    <div className="bg-gray-50 border border-gray-200 p-4 sm:p-5 rounded-sm">
                      <h2 className="text-xs sm:text-sm font-black text-black uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                        Popup Settings
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Delay (sec)</label>
                          <input
                            type="number"
                            value={formData.popupSettings.delay}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                popupSettings: {
                                  ...prev.popupSettings,
                                  delay: parseInt(e.target.value),
                                },
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Show Again (hrs)</label>
                          <input
                            type="number"
                            value={formData.popupSettings.showAgainAfter}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                popupSettings: {
                                  ...prev.popupSettings,
                                  showAgainAfter: parseInt(e.target.value),
                                },
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview & Submit */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <div
                  className="border border-gray-200 p-4 sm:p-6 rounded-sm mb-6"
                  style={{
                    backgroundColor: formData.backgroundColor,
                    color: formData.textColor,
                  }}
                >
                  <h3 className="text-[9px] font-black uppercase tracking-widest mb-4 opacity-40">
                    Live Preview
                  </h3>
                  {formData.buttonType !== "default" && (
                    <span className="inline-block bg-black text-white px-2 py-0.5 rounded-sm text-[8px] font-bold mb-3 uppercase">
                      {getButtonTypeStyle(formData.buttonType).icon}{" "}
                      {getButtonTypeStyle(formData.buttonType).label}
                    </span>
                  )}
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-32 sm:h-40 object-cover rounded-sm mb-4 border border-gray-200"
                    />
                  )}
                  <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                    {formData.headline}
                  </h4>
                  <p className="text-xs sm:text-sm opacity-80 mt-1">
                    {formData.subHeadline}
                  </p>
                  <button
                    type="button"
                    style={{
                      backgroundColor: formData.buttonColor,
                      color: formData.buttonTextColor,
                    }}
                    className="mt-4 px-5 py-1.5 rounded-sm font-bold text-xs uppercase tracking-wider"
                  >
                    {formData.buttonText}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/bannerlist")}
                    className="px-6 py-2.5 border border-gray-200 text-black font-bold uppercase tracking-widest text-[10px] hover:border-black transition-colors rounded-sm w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating || uploading}
                    className="px-6 py-2.5 bg-black text-white font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-sm w-full sm:w-auto"
                  >
                    {isUpdating ? (
                      "Saving..."
                    ) : (
                      <>
                        <FaSave size={10} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerUpdate;
