/* eslint-disable no-unused-vars */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminMenu from "./AdminMenu";
import { useCreateBannerMutation } from "@redux/api/bannerApiSlice";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { useGetProductsQuery } from "@redux/api/productApiSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL, UPLOAD_URL } from "../../redux/constants"; 
import {
  FaPlus,
  FaCloudUploadAlt,
  FaTrash,
  FaArrowLeft,
  FaImage,
  FaMobileAlt,
  FaDesktop,
  FaTag,
  FaSave,
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
      Loading...
    </p>
  </div>
);

const BannerCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);

  const [createBanner, { isLoading }] = useCreateBannerMutation();
  const { data: categories } = useFetchCategoriesQuery();
  const { data: products } = useGetProductsQuery({});

  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", type: "hero", headline: "", subHeadline: "", image: "", mobileImage: "",
    buttonText: "Shop Now", buttonType: "default", link: "", product: "", category: "",
    position: 1, backgroundColor: "#ffffff", textColor: "#000000", buttonColor: "#000000",
    buttonTextColor: "#ffffff", startDate: "", endDate: "", isActive: true,
    displayPages: ["home"], displayOn: { desktop: true, mobile: true, tablet: true },
    popupSettings: { delay: 5, showAgainAfter: 24, couponCode: "", discountAmount: 0 },
    offerSettings: { offerType: "percentage", offerValue: 0, isLimitedTime: false, countdownEndTime: "" },
  });

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

  const bannerTypes = [
    { value: "hero", label: "Hero Banner" }, { value: "category", label: "Category Banner" },
    { value: "promotional", label: "Promotional" }, { value: "sidebar", label: "Sidebar" },
    { value: "popup", label: "Popup" }, { value: "footer", label: "Footer" },
    { value: "top-bar", label: "Top Bar" }, { value: "middle", label: "Middle" },
  ];

  const offerTypes = [
    { value: "percentage", label: "Percentage Discount" }, { value: "fixed", label: "Fixed Amount" },
    { value: "bogo", label: "Buy 1 Get 1 Free" }, { value: "free-shipping", label: "Free Shipping" },
  ];

  const displayPageOptions = [
    { value: "home", label: "Homepage" }, { value: "category", label: "Category" },
    { value: "product", label: "Product" }, { value: "cart", label: "Cart" },
    { value: "checkout", label: "Checkout" }, { value: "all", label: "All Pages" },
  ];

  const handleImageUpload = async (e, isMobile = false) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);
    try {
      // এখানে API_URL যোগ করা হয়েছে
      const { data } = await axios.post(`${API_URL}${UPLOAD_URL}/banner`, uploadFormData, { headers: { "Content-Type": "multipart/form-data" } });
      setFormData((prev) => ({ ...prev, [isMobile ? "mobileImage" : "image"]: data.image }));
      toast.success(`${isMobile ? "Mobile" : "Desktop"} image uploaded!`);
    } catch (error) { toast.error("Upload failed"); } finally { setUploading(false); }
  };

  const handleDualUpload = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("desktop", files[0]);
    if (files[1]) uploadFormData.append("mobile", files[1]);
    try {
      // এখানে API_URL যোগ করা হয়েছে
      const { data } = await axios.post(`${API_URL}${UPLOAD_URL}/banner/dual`, uploadFormData, { headers: { "Content-Type": "multipart/form-data" } });
      setFormData((prev) => ({ ...prev, image: data.desktop?.url || "", mobileImage: data.mobile?.url || "" }));
      toast.success("Images uploaded successfully!");
    } catch (error) { toast.error("Upload failed"); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) return toast.error("Please upload banner image");
    if (!formData.headline) return toast.error("Headline is required");
    try {
      await createBanner(formData).unwrap();
      toast.success("Banner created successfully!");
      navigate("/admin/bannerlist");
    } catch (error) { toast.error(error.data?.error || "Failed to create banner"); }
  };

  const handleDisplayPageChange = (page) => {
    setFormData((prev) => {
      const current = prev.displayPages;
      if (current.includes(page)) return { ...prev, displayPages: current.filter((p) => p !== page) };
      return { ...prev, displayPages: [...current, page] };
    });
  };

  const getButtonTypeStyle = (type) => buttonTypeOptions.find((opt) => opt.value === type) || buttonTypeOptions[0];

  // Reusable Styles
  const inputClass = "w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass = "text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-mono pt-10 pb-16 transition-all duration-500">
      <div className="flex flex-col 2xl:flex-row">
        <AdminMenu />
        <div className="flex-1 px-4">
          <div className="max-w-[1200px] mx-auto">
            
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-l-4 border-black pl-4 sm:pl-6 py-2 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tighter uppercase">
                  Create / <span className="text-red-600">Banner</span>
                </h1>
                <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">
                  Step {step} of 3 | Configuration
                </p>
              </div>
              <button onClick={() => navigate("/admin/bannerlist")} className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-xs font-bold uppercase tracking-wider">
                <FaArrowLeft size={10} /> Back to List
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`flex-1 h-1.5 rounded-sm transition-colors ${s <= step ? "bg-black" : "bg-gray-200"}`} />
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* STEP 1: Images */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-gray-200 p-4 sm:p-6 rounded-sm bg-white">
                  <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <FaImage size={12} /> 1. Upload Assets
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Desktop Image */}
                    <div>
                      <label className={labelClass}>Desktop Image * (3000x1000px)</label>
                      {formData.image ? (
                        <div className="relative group border border-gray-200 rounded-sm overflow-hidden">
                          <img src={formData.image} alt="Desktop" className="w-full h-40 sm:h-48 object-cover" />
                          <button type="button" onClick={() => setFormData((prev) => ({ ...prev, image: "" }))} className="absolute top-1 right-1 bg-black text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"><FaTrash size={9} /></button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 sm:h-48 border border-dashed border-gray-300 rounded-sm cursor-pointer hover:border-black transition-colors bg-gray-50">
                          {uploading ? <LoadingSpinner /> : <><FaCloudUploadAlt className="text-xl text-gray-400" /><span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Upload Desktop</span></>}
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* Mobile Image */}
                    <div>
                      <label className={labelClass}>Mobile Image (1200x1200px)</label>
                      {formData.mobileImage ? (
                        <div className="relative group border border-gray-200 rounded-sm overflow-hidden">
                          <img src={formData.mobileImage} alt="Mobile" className="w-full h-40 sm:h-48 object-cover" />
                          <button type="button" onClick={() => setFormData((prev) => ({ ...prev, mobileImage: "" }))} className="absolute top-1 right-1 bg-black text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"><FaTrash size={9} /></button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 sm:h-48 border border-dashed border-gray-300 rounded-sm cursor-pointer hover:border-black transition-colors bg-gray-50">
                          <FaMobileAlt className="text-xl text-gray-400" />
                          <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Upload Mobile</span>
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Quick Upload */}
                  <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-sm">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <FaDesktop className="text-gray-400" size={12} />
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Upload both at once (select 2 files)</span>
                      <input type="file" accept="image/*" multiple onChange={handleDualUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="flex justify-end mt-8 border-t border-gray-100 pt-4">
                    <button type="button" onClick={() => setStep(2)} disabled={!formData.image} className="px-6 py-2.5 bg-black text-white font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed rounded-sm">
                      Next Step →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Content */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-gray-200 p-4 sm:p-6 rounded-sm bg-white">
                  <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider mb-6 border-b border-gray-100 pb-2">2. Content & Links</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div><label className={labelClass}>Banner Type *</label><select value={formData.type} onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))} className={selectClass}>{bannerTypes.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}</select></div>
                    <div><label className={labelClass}>Banner Name (Admin) *</label><input type="text" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="E.g., Eid Sale 2025" className={inputClass} required /></div>
                    <div className="md:col-span-2"><label className={labelClass}>Headline *</label><input type="text" value={formData.headline} onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))} placeholder="বছরসেরা ঈদ ধামাকা!" className={inputClass} required /></div>
                    <div className="md:col-span-2"><label className={labelClass}>Sub Headline</label><input type="text" value={formData.subHeadline} onChange={(e) => setFormData((prev) => ({ ...prev, subHeadline: e.target.value }))} placeholder="৪০% পর্যন্ত ছাড়" className={inputClass} /></div>
                    
                    <div>
                      <label className={`${labelClass} flex items-center gap-1`}><FaTag size={9} /> Button Type</label>
                      <select value={formData.buttonType} onChange={(e) => setFormData((prev) => ({ ...prev, buttonType: e.target.value }))} className={selectClass}>
                        {buttonTypeOptions.map((type) => (<option key={type.value} value={type.value}>{type.icon} {type.label}</option>))}
                      </select>
                      <div className="mt-2"><span className="inline-block bg-black text-white px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase">{getButtonTypeStyle(formData.buttonType).icon} {getButtonTypeStyle(formData.buttonType).label}</span></div>
                    </div>

                    <div><label className={labelClass}>Button Text</label><input type="text" value={formData.buttonText} onChange={(e) => setFormData((prev) => ({ ...prev, buttonText: e.target.value }))} placeholder="Shop Now" className={inputClass} /></div>
                    <div><label className={labelClass}>Link URL</label><input type="text" value={formData.link} onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))} placeholder="/shop or https://..." className={inputClass} /></div>
                    <div><label className={labelClass}>Link to Product</label><select value={formData.product} onChange={(e) => setFormData((prev) => ({ ...prev, product: e.target.value }))} className={selectClass}><option value="">Select Product (Optional)</option>{products?.products?.map((product) => (<option key={product._id} value={product._id}>{product.name}</option>))}</select></div>
                    <div><label className={labelClass}>Link to Category</label><select value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} className={selectClass}><option value="">Select Category (Optional)</option>{categories?.map((category) => (<option key={category._id} value={category._id}>{category.name}</option>))}</select></div>
                  </div>

                  {/* Colors */}
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-4">Theme Colors</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[ { key: "backgroundColor", label: "Background" }, { key: "textColor", label: "Text" }, { key: "buttonColor", label: "Button" }, { key: "buttonTextColor", label: "Btn Text" } ].map((color) => (
                        <div key={color.key} className="flex items-center gap-2">
                          <input type="color" value={formData[color.key]} onChange={(e) => setFormData((prev) => ({ ...prev, [color.key]: e.target.value }))} className="w-8 h-8 border border-gray-200 rounded-sm cursor-pointer p-0.5" />
                          <span className="text-[9px] font-bold text-gray-600 uppercase">{color.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between mt-8 border-t border-gray-100 pt-4">
                    <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 border border-gray-200 text-black font-bold uppercase tracking-widest text-[10px] hover:border-black transition-colors rounded-sm">← Back</button>
                    <button type="button" onClick={() => setStep(3)} disabled={!formData.name || !formData.headline} className="px-6 py-2.5 bg-black text-white font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 transition-colors disabled:bg-gray-400 rounded-sm">Next Step →</button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Settings */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-gray-200 p-4 sm:p-6 rounded-sm bg-white">
                  <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider mb-6 border-b border-gray-100 pb-2">3. Settings & Schedule</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                    <div><label className={labelClass}>Position Order</label><input type="number" value={formData.position} onChange={(e) => setFormData((prev) => ({ ...prev, position: parseInt(e.target.value) }))} min={1} className={inputClass} /></div>
                    <div className="flex items-center gap-4 pt-4"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active</label><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))} className="accent-black w-4 h-4" /></div>
                    <div><label className={labelClass}>Start Date</label><input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))} className={inputClass} /></div>
                    <div><label className={labelClass}>End Date</label><input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))} className={inputClass} /></div>
                  </div>

                  {/* Display Pages */}
                  <div className="mb-6 border-t border-gray-100 pt-6">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3">Display On Pages</h3>
                    <div className="flex flex-wrap gap-2">
                      {displayPageOptions.map((page) => (
                        <label key={page.value} className={`px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${formData.displayPages.includes(page.value) ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-black"}`}>
                          <input type="checkbox" checked={formData.displayPages.includes(page.value)} onChange={() => handleDisplayPageChange(page.value)} className="hidden" />{page.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Device Settings */}
                  <div className="mb-6 border-t border-gray-100 pt-6">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3">Display On Devices</h3>
                    <div className="flex flex-wrap gap-6">
                      {[ { key: "desktop", label: "Desktop", icon: "💻" }, { key: "mobile", label: "Mobile", icon: "📱" }, { key: "tablet", label: "Tablet", icon: "📱" } ].map((device) => (
                        <label key={device.key} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={formData.displayOn[device.key]} onChange={(e) => setFormData((prev) => ({ ...prev, displayOn: { ...prev.displayOn, [device.key]: e.target.checked } }))} className="accent-black w-4 h-4" />
                          <span className="text-xs font-bold text-gray-700">{device.icon} {device.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Popup Settings */}
                  {formData.type === "popup" && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-sm">
                      <h3 className="text-[10px] font-black text-black uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Popup Settings</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Delay (seconds)</label><input type="number" value={formData.popupSettings.delay} onChange={(e) => setFormData((prev) => ({ ...prev, popupSettings: { ...prev.popupSettings, delay: parseInt(e.target.value) } }))} className={inputClass} /></div>
                        <div><label className={labelClass}>Show Again After (hrs)</label><input type="number" value={formData.popupSettings.showAgainAfter} onChange={(e) => setFormData((prev) => ({ ...prev, popupSettings: { ...prev.popupSettings, showAgainAfter: parseInt(e.target.value) } }))} className={inputClass} /></div>
                        <div><label className={labelClass}>Coupon Code</label><input type="text" value={formData.popupSettings.couponCode} onChange={(e) => setFormData((prev) => ({ ...prev, popupSettings: { ...prev.popupSettings, couponCode: e.target.value } }))} placeholder="WELCOME100" className={inputClass} /></div>
                        <div><label className={labelClass}>Discount Amount</label><input type="number" value={formData.popupSettings.discountAmount} onChange={(e) => setFormData((prev) => ({ ...prev, popupSettings: { ...prev.popupSettings, discountAmount: parseInt(e.target.value) } }))} className={inputClass} /></div>
                      </div>
                    </div>
                  )}

                  {/* Offer Settings */}
                  {(formData.type === "promotional" || formData.type === "middle") && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-sm">
                      <h3 className="text-[10px] font-black text-black uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Offer Settings</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Offer Type</label><select value={formData.offerSettings.offerType} onChange={(e) => setFormData((prev) => ({ ...prev, offerSettings: { ...prev.offerSettings, offerType: e.target.value } }))} className={selectClass}>{offerTypes.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}</select></div>
                        <div><label className={labelClass}>Offer Value</label><input type="number" value={formData.offerSettings.offerValue} onChange={(e) => setFormData((prev) => ({ ...prev, offerSettings: { ...prev.offerSettings, offerValue: parseInt(e.target.value) } }))} className={inputClass} /></div>
                        <div className="flex items-center gap-4"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Limited Time</label><input type="checkbox" checked={formData.offerSettings.isLimitedTime} onChange={(e) => setFormData((prev) => ({ ...prev, offerSettings: { ...prev.offerSettings, isLimitedTime: e.target.checked } }))} className="accent-black w-4 h-4" /></div>
                        {formData.offerSettings.isLimitedTime && (<div><label className={labelClass}>Countdown End Time</label><input type="datetime-local" value={formData.offerSettings.countdownEndTime} onChange={(e) => setFormData((prev) => ({ ...prev, offerSettings: { ...prev.offerSettings, countdownEndTime: e.target.value } }))} className={inputClass} /></div>)}
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="mb-6 border border-gray-200 rounded-sm overflow-hidden">
                    <div className="p-4 sm:p-6" style={{ backgroundColor: formData.backgroundColor, color: formData.textColor }}>
                      <h3 className="text-[9px] font-black uppercase tracking-widest mb-3 opacity-40">Live Preview</h3>
                      {formData.buttonType !== "default" && (<span className="inline-block bg-black text-white px-2 py-0.5 rounded-sm text-[8px] font-bold mb-3 uppercase">{getButtonTypeStyle(formData.buttonType).icon} {getButtonTypeStyle(formData.buttonType).label}</span>)}
                      {formData.image && (<img src={formData.image} alt="Banner" className="w-full h-32 sm:h-40 object-cover rounded-sm mb-4 border border-gray-200" />)}
                      <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight">{formData.headline}</h4>
                      <p className="text-xs sm:text-sm opacity-80 mt-1">{formData.subHeadline}</p>
                      <button type="button" style={{ backgroundColor: formData.buttonColor, color: formData.buttonTextColor }} className="mt-4 px-5 py-1.5 rounded-sm font-bold text-xs uppercase tracking-wider">{formData.buttonText}</button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-3 border-t border-gray-100 pt-4">
                    <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 border border-gray-200 text-black font-bold uppercase tracking-widest text-[10px] hover:border-black transition-colors rounded-sm w-full sm:w-auto">← Back</button>
                    <button type="submit" disabled={isLoading || uploading} className="px-6 py-2.5 bg-black text-white font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2 rounded-sm w-full sm:w-auto">
                      {isLoading ? "Creating..." : <><FaSave size={10} /> Create Banner</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerCreate;
