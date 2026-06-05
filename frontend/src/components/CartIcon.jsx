/* eslint-disable react/prop-types */
import { motion, AnimatePresence } from "framer-motion";
import { RiShoppingBag3Fill } from "react-icons/ri";
import { Link } from "react-router-dom";

const CartIcon = ({ cartCount, onClick }) => {
  return (
    <Link to="/cart" onClick={onClick} className="relative group block p-1">
      <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all duration-300 group-hover:bg-white/10">
        <RiShoppingBag3Fill
          className="text-gray-400 transition-colors duration-300 group-hover:text-[#D4A843]"
          size={18}
        />

        {/* Dynamic Badge */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 sm:h-[18px] sm:w-[18px] text-[8px] sm:text-[9px] font-bold text-[#1A1A1A] bg-[#D4A843] rounded-full border-2 border-[#1A1A1A]"
            >
              {cartCount}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </Link>
  );
};

export default CartIcon;