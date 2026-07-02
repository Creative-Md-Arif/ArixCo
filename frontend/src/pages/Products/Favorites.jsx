import { useSelector, useDispatch } from "react-redux";
import {
  selectFavoriteProduct,
  removeFromFavorites,
} from "../../redux/features/favorite/favoriteSlice";
import { removeFavoriteFromLocalStorage } from "../../Utils/localStorage";
import Product from "../Products/Product";
import { Link } from "react-router-dom";
import { LuHeart } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { FaArrowRight, FaHome } from "react-icons/fa";
import { HiChevronRight } from "react-icons/hi";

const Favorites = () => {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavoriteProduct);

  const removeHandler = (product) => {
    dispatch(removeFromFavorites(product));
    removeFavoriteFromLocalStorage(product._id);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-10 pb-16">
      {/* Breadcrumb & Header Section */}
   <div className="bg-white border-b border-gray-100 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
    {/* Breadcrumb */}
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex items-center gap-1.5 text-[14px] font-playfair font-medium flex-wrap bg-white"
    >
      {/* Home Link with FaHome Icon */}
      <Link
        to="/"
        className="flex items-center gap-1.5 text-black hover:underline text-[14px] font-medium"
      >
        <FaHome className="text-[14px]" />
        <span>Home</span>
      </Link>

      {/* Current Page: Wishlist */}
      <span className="contents">
        <HiChevronRight className="text-[14px] text-black flex-shrink-0" />
        <span className="text-black font-black text-[14px]">
          Wishlist
        </span>
      </span>
    </nav>

    {/* Title */}
    <div className="flex items-center justify-between">
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 uppercase tracking-wider font-mono border-l-4 border-[#D4A843] pl-3">
        My Wishlist
      </h1>
      <p className="text-xs sm:text-sm text-gray-500 font-medium">
        {favorites.length} saved{" "}
        {favorites.length === 1 ? "item" : "items"}
      </p>
    </div>
  </div>
</div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 mt-8 sm:mt-10">
        {favorites.length === 0 ? (
          // Empty State Design
          <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <LuHeart className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-gray-500 mb-8 text-center max-w-xs">
              Save your favorite items here to find them easily later.
            </p>
            <Link
              to="/shop"
              className="flex items-center gap-2 bg-black text-white py-3 px-8 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-[#D4A843] transition-all shadow-md"
            >
              Explore Shop <FaArrowRight size={10} />
            </Link>
          </div>
        ) : (
          // Grid Design
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {favorites.map((product) => (
              <div
                key={product._id}
                className="relative group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Product Component */}
                <Product product={product} />

                {/* Interactive Remove Button */}
                <button
                  onClick={() => removeHandler(product)}
                  className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 hover:scale-110 transition-all duration-200 shadow-sm z-10 border border-gray-100 hover:border-red-200"
                  aria-label="Remove from favorites"
                >
                  <IoMdClose size={14} className="sm:w-[16px] sm:h-[16px]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
