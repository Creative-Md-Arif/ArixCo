/* eslint-disable react/prop-types */
import { useGetSiteSettingsQuery } from "@redux/api/siteSettingApiSlice";

const Logo = ({ className = "" }) => {
  const { data, isLoading } = useGetSiteSettingsQuery();
  const settings = data?.data;

  // লোডিং অবস্থায় ব্ল্যাক ব্যাকগ্রাউন্ডের জন্য উপযুক্ত স্কেলিটন দেখানো হবে
  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="h-8 w-24 sm:h-10 sm:w-32 bg-gray-700/50 rounded animate-pulse"></div>
      </div>
    );
  }

  // ১. যদি logoType "image" হয় এবং লোগোর URL থাকে
  if (settings?.logoType === "image" && settings?.logo?.url) {
    return (
      <div className={`flex items-center cursor-pointer group ${className}`}>
        <img
          src={settings.logo.url}
          alt="Site Logo"
          className="h-9 sm:h-12 w-auto object-contain"
        />
      </div>
    );
  }

  // ২. যদি logoType "text" হয় এবং textLogo পার্টস থাকে
  if (settings?.logoType === "text" && settings?.textLogo?.parts?.length > 0) {
    return (
      <div className={`flex items-center cursor-pointer group ${className}`}>
        <div 
          className="flex items-baseline whitespace-nowrap"
          style={{
            fontSize: settings.textLogo.fontSize || "24px",
            fontWeight: settings.textLogo.fontWeight || "bold"
          }}
        >
          {settings.textLogo.parts.map((part, index) => (
            <span 
              key={index} 
              style={{ color: part.color }}
              className="uppercase"
            >
              {part.text}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ৩. ডিফল্ট লোগো (যদি এপিআই থেকে কোনো ডেটা না আসে বা ডাটাবেসে কিছু সেট না করা থাকে)
  return (
    <div className={`flex items-center cursor-pointer group ${className}`}>
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline whitespace-nowrap">
          <span className="text-2xl font-black font-poppins tracking-px text-white uppercase">
            Ari<span className="text-[#B88E2F]">x</span>
          </span>

          <span className="text-lg sm:text-2xl font-black font-poppins text-[#B88E2F] ml-1 uppercase">
            Co.
          </span>
        </div>

        <div className="h-[1.5px] w-full bg-gradient-to-r from-white/40 to-[#B88E2F] mt-1.5"></div>
      </div>
    </div>
  );
};

export default Logo;