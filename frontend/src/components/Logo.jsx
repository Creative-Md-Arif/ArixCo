/* eslint-disable react/prop-types */
import { useGetSiteSettingsQuery } from "@redux/api/siteSettingApiSlice";

const Logo = ({ className = "" }) => {
  const { data } = useGetSiteSettingsQuery();
  const logoUrl = data?.data?.logo?.url;


  if (logoUrl) {
    return (
      <div className={`flex items-center cursor-pointer group ${className}`}>
        <img
          src={logoUrl}
          alt="Arix Co."
          className="h-9 sm:h-12 w-auto object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center cursor-pointer group ${className}`}>
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline whitespace-nowrap">
          <span className="text-2xl  font-black font-poppins tracking-px text-white uppercase">
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