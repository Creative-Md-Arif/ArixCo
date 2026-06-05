import { motion } from "framer-motion";

/*
  SECTION IDENTITY: Footer Bottom
  BG: Near-white neutral #F9FAFB (subtle separation from pure white)
  PATTERN: Ultra-subtle chevron wave — closing flourish, premium signature
  Optimized for: white-bg readability, clean visual closure, WCAG AA contrast
*/
const BG = {
  backgroundColor: "#F9FAFB",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='16'%3E%3Cpath d='M0 8 L12 2 L24 8 L36 2 L48 8' fill='none' stroke='%23B88E2F' stroke-opacity='0.04' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M0 14 L12 8 L24 14 L36 8 L48 14' fill='none' stroke='%23B88E2F' stroke-opacity='0.03' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundSize: "48px 16px",
};

const FooterBottom = () => {
  const year = new Date().getFullYear();

  return (
    <div className="border-t border-gray-200 font-figtree" style={BG}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col items-center gap-2.5">

          <motion.div
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 48, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="h-[2px] bg-[#B88E2F] rounded-full"
          />

          <p className="text-[11px] sm:text-xs font-bold text-gray-800 text-center tracking-[0.15em] uppercase">
            &copy; {year}{" "}
            <span className="text-[#B88E2F]">AriX GeaR</span>
            {" "}— All rights reserved.
          </p>

          <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 tracking-[0.25em] uppercase">
            Elevating Technology
          </p>

        </div>
      </div>
    </div>
  );
};

export default FooterBottom;