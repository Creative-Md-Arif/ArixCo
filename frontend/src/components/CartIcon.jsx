/* eslint-disable react/prop-types */
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useDispatch } from "react-redux";
import { toggleCartSidebar } from "../redux/features/cart/cartSlice";

const CartIcon = ({ cartCount }) => {
  const dispatch = useDispatch();
  const handleOpenCart = () => {
    dispatch(toggleCartSidebar(true));
  };

  return (
    <button
      onClick={handleOpenCart}
      className="relative group block outline-none"
      aria-label="Open Shopping Cart"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 group-hover:bg-white/10">
        <HiOutlineShoppingBag
          className="text-gray-400 transition-colors duration-300 group-hover:text-[#D4A843]"
          size={17}
        />
        {/* Dynamic Badge */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-[15px] w-[15px] sm:h-4 sm:w-4 text-[8px] sm:text-[9px] font-bold text-[#1A1A1A] bg-[#D4A843] rounded-full border-2 border-[#1A1A1A]"
            >
              {cartCount}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
};

export default CartIcon;