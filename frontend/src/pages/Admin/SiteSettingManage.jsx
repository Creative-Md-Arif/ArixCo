import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminMenu from "./AdminMenu";
import { BASE_URL } from "../../redux/constants";
import {
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from "@redux/api/siteSettingApiSlice";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaLinkedin,
  FaSave,
  FaCog,
  FaImage,
  FaUpload,
} from "react-icons/fa";

// --- Skeleton Loader ---
const FormSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {[...Array(2)].map((_, i) => (
      <div
        key={i}
        className="bg-white border border-gray-200 rounded-sm p-6 space-y-4 animate-pulse"
      >
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

const SiteSettingManage = () => {
  const { data, isLoading } = useGetSiteSettingsQuery();
  const [updateSiteSettings, { isLoading: isSaving }] =
    useUpdateSiteSettingsMutation();

  const [contact, setContact] = useState({ email: "", phone: "", address: "" });
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
    linkedin: "",
  });
  const [copyrightText, setCopyrightText] = useState("");
  const [logo, setLogo] = useState({ url: "", public_id: "" });
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (data?.data) {
      setContact(data.data.contact || { email: "", phone: "", address: "" });
      setSocialLinks(
        data.data.socialLinks || {
          facebook: "",
          instagram: "",
          youtube: "",
          twitter: "",
          linkedin: "",
        },
      );
      setCopyrightText(data.data.copyrightText || "");
      setLogo(data.data.logo || { url: "", public_id: "" });
    }
  }, [data]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/upload/logo`, {
        method: "POST",
        credentials: "include",
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Upload failed");
      }

      setLogo({ url: result.url, public_id: result.public_id });
      toast.success("Logo uploaded — click Save Changes to apply");
    } catch (error) {
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
      e.target.value = ""; // একই ফাইল আবার সিলেক্ট করলেও onChange ট্রিগার হবে
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSiteSettings({
        contact,
        socialLinks,
        copyrightText,
        logo,
      }).unwrap();
      toast.success("Site settings updated successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update settings");
    }
  };

  const inputClass =
    "w-full bg-white border border-gray-200 rounded-sm px-4 py-2.5 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all font-['Trebuchet_MS']";
  const labelClass =
    "flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 mb-2";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h2 className="text-base font-['Playfair_Display'] font-bold text-gray-700 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                Contact Info, Social Links & Footer
              </h2>
            </div>
          </header>

          {isLoading ? (
            <FormSkeleton />
          ) : (
            <form onSubmit={handleSave}>
              {/* Logo */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-sm p-6 mb-6"
              >
                <h2 className="text-base font-black uppercase tracking-widest text-black mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <FaImage size={14} className="text-gray-400" /> Site Logo
                </h2>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-32 h-32 shrink-0 border border-gray-200 rounded-sm bg-gray-50 flex items-center justify-center overflow-hidden">
                    {logo.url ? (
                      <img
                        src={logo.url}
                        alt="Site logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <FaImage className="text-3xl text-gray-300" />
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="logo-upload"
                      className={`inline-flex items-center gap-2 py-2.5 px-5 border text-sm font-bold uppercase tracking-widest transition-all rounded-sm cursor-pointer ${
                        isUploadingLogo
                          ? "border-gray-200 text-gray-400 cursor-not-allowed"
                          : "border-black text-black hover:bg-black hover:text-white"
                      }`}
                    >
                      {isUploadingLogo ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FaUpload size={12} />
                      )}
                      {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      PNG, JPG, WEBP or SVG — max 2MB. Uploads instantly; click{" "}
                      <span className="font-bold text-black">Save Changes</span>{" "}
                      to apply.
                    </p>
                  </div>
                </div>
              </motion.section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Contact Info */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-sm p-6"
                >
                  <h2 className="text-base font-black uppercase tracking-widest text-black mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                    <FaCog size={14} className="text-gray-400" /> Contact Info
                  </h2>

                  <div className="mb-4">
                    <label className={labelClass}>
                      <FaEnvelope size={12} /> Email
                    </label>
                    <input
                      type="email"
                      className={inputClass}
                      value={contact.email}
                      onChange={(e) =>
                        setContact({ ...contact, email: e.target.value })
                      }
                      placeholder="support@arixgear.com"
                    />
                  </div>

                  <div className="mb-4">
                    <label className={labelClass}>
                      <FaPhone size={12} /> Phone
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      value={contact.phone}
                      onChange={(e) =>
                        setContact({ ...contact, phone: e.target.value })
                      }
                      placeholder="+880 17100000000"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <FaMapMarkerAlt size={12} /> Address
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      value={contact.address}
                      onChange={(e) =>
                        setContact({ ...contact, address: e.target.value })
                      }
                      placeholder="Dhaka, Bangladesh"
                    />
                  </div>
                </motion.section>

                {/* Social Links */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-white border border-gray-200 rounded-sm p-6"
                >
                  <h2 className="text-base font-black uppercase tracking-widest text-black mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                    <FaFacebook size={14} className="text-gray-400" /> Follow Us
                  </h2>

                  {[
                    {
                      key: "facebook",
                      icon: FaFacebook,
                      ph: "https://facebook.com/...",
                    },
                    {
                      key: "instagram",
                      icon: FaInstagram,
                      ph: "https://instagram.com/...",
                    },
                    {
                      key: "youtube",
                      icon: FaYoutube,
                      ph: "https://youtube.com/...",
                    },
                    {
                      key: "twitter",
                      icon: FaTwitter,
                      ph: "https://twitter.com/...",
                    },
                    {
                      key: "linkedin",
                      icon: FaLinkedin,
                      ph: "https://linkedin.com/...",
                    },
                  ].map(({ key, icon: Icon, ph }) => (
                    <div className="mb-4 last:mb-0" key={key}>
                      <label className={labelClass}>
                        <Icon size={12} /> {key}
                      </label>
                      <input
                        type="text"
                        className={inputClass}
                        value={socialLinks[key]}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            [key]: e.target.value,
                          })
                        }
                        placeholder={ph}
                      />
                    </div>
                  ))}
                </motion.section>
              </div>

              {/* Copyright */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-gray-200 rounded-sm p-6 mb-6"
              >
                <label className={labelClass}>Copyright Text</label>
                <input
                  type="text"
                  className={inputClass}
                  value={copyrightText}
                  onChange={(e) => setCopyrightText(e.target.value)}
                  placeholder="ARIX CO — All rights reserved."
                />
              </motion.section>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaSave size={12} />
                )}
                Save Changes
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default SiteSettingManage;
