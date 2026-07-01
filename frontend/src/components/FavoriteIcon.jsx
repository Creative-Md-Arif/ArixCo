/* eslint-disable react/prop-types */
import { HiOutlineHeart } from "react-icons/hi2";
import { Link } from "react-router-dom";
import FavoritesCount from "../pages/Products/FavoritesCount";

const FavoriteIcon = ({ onClick }) => {
  return (
    <Link to="/favorite" onClick={onClick} className="relative group block p-1">
      <div className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 group-hover:bg-white/10">
        <HiOutlineHeart
          className="text-gray-400 transition-colors duration-300 group-hover:text-[#D4A843]"
          size={17}
        />

        {/* Badge Position */}
        <div className="absolute top-0 right-0">
          <FavoritesCount />
        </div>
      </div>
    </Link>
  );
};

export default FavoriteIcon;