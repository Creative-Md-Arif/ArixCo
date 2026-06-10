/* eslint-disable react/prop-types */
const Logo = ({ className }) => {
  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-2 cursor-pointer group ${className}`}
    >
      {/* Logo Icon */}
      <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
        <div className="absolute w-full h-full border-2 border-dashed border-blue-500 rounded-full animate-[spin_10s_linear_infinite]"></div>
        <span className="text-lg sm:text-2xl font-black text-blue-600 z-10 font-mono tracking-tighter">
          A<span className="text-[#B88E2F]">X</span>
        </span>
      </div>

      {/* Brand Name */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center whitespace-nowrap">
          <span className="text-lg sm:text-2xl font-extrabold font-mono tracking-tighter text-blue-600">
            Ari<span className="text-[#B88E2F]">X</span>
          </span>
          <span className="text-lg sm:text-2xl font-black font-serif text-[#B88E2F] ml-0.5 sm:ml-1">
            Co.
          </span>
        </div>
        {/* Underline */}
        <div className="h-[2px] w-full bg-gradient-to-r from-blue-600 to-[#B88E2F]"></div>
        {/* Tagline */}
        <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold text-gray-500 whitespace-nowrap">
          Clothing & Apparel
        </span>
      </div>
    </div>
  );
};

export default Logo;