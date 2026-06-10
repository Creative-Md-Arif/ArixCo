/* eslint-disable react/prop-types */
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CiShoppingCart } from "react-icons/ci";
import { FaLongArrowAltRight, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";

const AddToCartButton = ({
  product,
  qty = 1,
  buttonText = "Add to Cart",
  addedText = "Added to Cart",
  customStyles = "",
  isOrderNow = false,
  variant = "both", // "add", "order", "both"
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart?.cartItems || []);

  if (!product) {
    return (
      <button
        disabled
        className="opacity-50 cursor-not-allowed px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-gray-100 text-gray-400 font-medium text-[11px] sm:text-sm border border-gray-200 h-full"
      >
        Loading...
      </button>
    );
  }

  const isAdded = cartItems.some((item) => {
    const sameProduct = item._id === product._id;
    if (!sameProduct) return false;
    if (product?.variantInfo?.hasVariants) {
      return (
        item.variantInfo?.colorIndex === product.variantInfo.colorIndex &&
        item.variantInfo?.sizeIndex === product.variantInfo.sizeIndex
      );
    }
    return true;
  });

  const mainImage =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : product?.image || "/placeholder.jpg";

  const createCartItem = () => ({
    _id: product._id,
    name: product.name,
    price: product.price || product.basePrice,
    finalPrice: product.finalPrice || product._effectivePrice || product.price,
    basePrice: product.basePrice,
    _effectivePrice: product._effectivePrice,
    effectivePrice: product.effectivePrice || product._effectivePrice,
    discountPercentage: product.discountPercentage,
    qty,
    image: mainImage,
    variantInfo: product.variantInfo || {
      hasVariants: false,
      colorIndex: null,
      colorName: "",
      colorHex: "",
      sizeIndex: null,
      sizeName: "",
      variantPrice: null,
      sku: "",
      countInStock: 0,
    },
    weight: product.weight || 0.5,
  });

  const handleAddToCart = () => {
    if (product.variantInfo?.hasVariants) {
      const stock = product.variantInfo.countInStock;
      if (stock !== undefined && stock < qty) {
        toast.error(`Only ${stock} units available for this variant!`);
        return;
      }
    } else if (product.countInStock < qty) {
      toast.error(`Only ${product.countInStock} units available!`);
      return;
    }

    if (!isAdded) {
      dispatch(addToCart(createCartItem()));
      const variantText = product.variantInfo?.hasVariants
        ? ` (${product.variantInfo.colorName} / ${product.variantInfo.sizeName})`
        : "";
      toast.success(`${product.name}${variantText} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  const handleOrderNow = () => {
    if (product.variantInfo?.hasVariants) {
      const stock = product.variantInfo.countInStock;
      if (stock !== undefined && stock < qty) {
        toast.error(`Only ${stock} units available for this variant!`);
        return;
      }
    } else if (product.countInStock < qty) {
      toast.error(`Only ${product.countInStock} units available!`);
      return;
    }
    dispatch(addToCart(createCartItem()));
    navigate("/shipping");
  };

  const renderAddToCartBtn = () => (
    <motion.button
      whileTap={!isAdded && product.countInStock !== 0 ? { scale: 0.96 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={handleAddToCart}
      disabled={isAdded || product.countInStock === 0}
      className={`group relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-4 sm:py-3 font-semibold text-[11px] sm:text-[13px] uppercase tracking-wider rounded-xl border-2 overflow-hidden transition-all duration-300 ease-out outline-none focus:outline-none w-full h-full
        ${
          isAdded
            ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
            : "border-[#1A1A1A] text-[#1A1A1A] bg-white hover:bg-[#1A1A1A] hover:text-white active:bg-gray-800"
        } ${customStyles}`}
    >
      {isAdded ? (
        <FaCheck className="text-sm transition-all duration-300" />
      ) : (
        <CiShoppingCart className="text-base sm:text-lg transition-all duration-300 group-hover:scale-110" />
      )}
      <span className="relative transition-all duration-300">
        {isAdded ? addedText : buttonText}
      </span>
    </motion.button>
  );

  const renderOrderNowBtn = () => (
    <div className="w-full flex flex-col h-full">
      <motion.button
        whileTap={product.countInStock !== 0 ? { scale: 0.97 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={handleOrderNow}
        disabled={product.countInStock === 0}
        className="group relative flex items-center justify-center px-4 py-2.5 sm:px-5 sm:py-3 bg-[#B88E2F] text-white rounded-xl font-semibold text-[11px] sm:text-[13px] uppercase tracking-wider transition-all duration-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-[#9a7828] active:bg-[#8a6a1f] border-2 border-[#B88E2F] disabled:border-gray-200 outline-none focus:outline-none w-full h-full"
      >
        <span className="relative flex items-center gap-2">
          Order Now
          <FaLongArrowAltRight className="text-sm sm:text-base group-hover:translate-x-1 transition-transform duration-300" />
        </span>
      </motion.button>

      {product.countInStock <= 5 && product.countInStock > 0 && (
        <p className="text-center text-[9px] sm:text-[11px] font-bold text-orange-600 mt-1.5 tracking-wide">
          Only {product.countInStock} units left!
        </p>
      )}
    </div>
  );

  if (variant === "add") return renderAddToCartBtn();
  if (variant === "order") return renderOrderNowBtn();

  // Default "both" layout for other pages if needed
  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
      {renderAddToCartBtn()}
      {isOrderNow && renderOrderNowBtn()}
    </div>
  );
};

export default AddToCartButton;
