/* eslint-disable react/prop-types */
import { HiHeart } from "react-icons/hi";
import { Link } from "react-router-dom";
import FavoritesCount from "../pages/Products/FavoritesCount";

const FavoriteIcon = ({ onClick }) => {
  return (
    <Link to="/favorite" onClick={onClick} className="relative group block p-1">
      <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all duration-300 group-hover:bg-white/10">
        <HiHeart 
          className="text-gray-400 transition-colors duration-300 group-hover:text-[#D4A843]" 
          size={18} 
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