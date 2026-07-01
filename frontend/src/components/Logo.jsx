/* eslint-disable react/prop-types */
const Logo = ({ className }) => {
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
