import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

const FavoritesCount = () => {
  const favorites = useSelector((state) => state.favorites);
  const favoriteCount = favorites?.length || 0;



  return (
    <AnimatePresence>
      {favoriteCount > 0 && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 text-[8px] sm:text-[10px] font-bold text-white bg-[#B88E2F] rounded-full border-2 border-white shadow-sm"
        >
          {favoriteCount}
        </motion.span>
      )}
    </AnimatePresence>
  );
};

export default FavoritesCount;