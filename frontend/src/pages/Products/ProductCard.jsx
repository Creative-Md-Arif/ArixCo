/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";
import { FaShoppingCart, FaEye } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

// Local helper for standard discount
const calculateEffectivePrice = (product) => {
  const price = product?.price || 0;
  const discountPercent = product?.discountPercentage || 0;
  if (discountPercent > 0) {
    return price - (price * discountPercent) / 100;
  }
  return price;
};

const ProductCard = ({ p, viewMode }) => {
  const dispatch = useDispatch();

  const finalPrice = calculateEffectivePrice(p);
  const originalPrice = p?.price || 0;
  const displayDiscountPercent = p?.discountPercentage || 0;

  const mainImage =
    Array.isArray(p?.images) && p.images.length > 0
      ? p.images[0]
      : p?.image || "/placeholder.jpg";

  const productPath = `/product/${p?.slug || p?._id}`;

  const addToCartHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ ...p, qty: 1 }));
    toast.success("Added to cart");
  };

  // List view mode
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col sm:flex-row gap-4 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300"
      >
        {/* Image */}
        <div className="relative w-full sm:w-48 h-48 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden group">
          <Link to={productPath} className="block w-full h-full">
            <img
              className="w-full h-full object-cover p-2 group-hover:scale-105 transition-transform duration-500"
              src={mainImage}
              alt={p?.name}
              loading="lazy"
            />
          </Link>

          {displayDiscountPercent > 0 && (
            <div className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm bg-gray-800">
              -{displayDiscountPercent}%
            </div>
          )}

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <HeartIcon product={p} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between py-2">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
              {p?.brand || "AriX GeaR"}
            </p>
            <Link to={productPath}>
              <h3 className="text-lg font-bold text-gray-800 hover:text-red-500 transition-colors line-clamp-2 mb-2">
                {p?.name}
              </h3>
            </Link>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-bold text-gray-900">
                ৳{Math.round(finalPrice).toLocaleString("en-BD")}
              </span>
              {displayDiscountPercent > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  ৳{originalPrice.toLocaleString("en-BD")}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={addToCartHandler}
              className="flex-1 bg-gray-900 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#B88E2F] transition-colors"
            >
              <FaShoppingCart size={14} />
              Add to Cart
            </button>
            <Link
              to={productPath}
              className="p-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <FaEye size={16} />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <div
      className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden min-h-fit flex flex-col"
      style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
    >
      {/* Image */}
      <div className="relative h-fit bg-gray-50 overflow-hidden flex-shrink-0">
        <Link to={productPath} className="block w-full h-full">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={mainImage}
            alt={p?.name}
            loading="lazy"
          />
        </Link>

        {displayDiscountPercent > 0 && (
          <div className="absolute top-2 left-2 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm bg-gray-800">
            -{displayDiscountPercent}%
          </div>
        )}

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <HeartIcon product={p} />
        </div>

        <button
          onClick={addToCartHandler}
          className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white text-[10px] font-bold py-2 flex items-center justify-center gap-1 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >
          <FaShoppingCart size={10} />
          Add to Cart
        </button>
      </div>

      {/* Content */}
      <div className="p-2.5 flex flex-col flex-grow">
        <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5 h-3 flex-shrink-0">
          {p?.brand || "AriX GeaR"}
        </p>

        <Link to={productPath} className="block h-[32px] mb-1.5 flex-shrink-0">
          <h3 className="text-[11px] font-bold text-gray-800 line-clamp-2 hover:text-red-500 transition-colors leading-tight">
            {p?.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-1.5 h-5 flex-shrink-0">
          <span className="text-sm font-bold text-gray-900">
            ৳{Math.round(finalPrice).toLocaleString("en-BD")}
          </span>
          {displayDiscountPercent > 0 && (
            <span className="text-[10px] text-gray-400 line-through">
              ৳{originalPrice.toLocaleString("en-BD")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
