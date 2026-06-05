/* eslint-disable react/prop-types */
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CiShoppingCart } from "react-icons/ci";
import { FaLongArrowAltRight } from "react-icons/fa";
import { motion } from "framer-motion";

const AddToCartButton = ({
  product,
  qty = 1,
  buttonText = "Add to Cart",
  addedText = "Added to Cart",
  customStyles = "",
  isOrderNow = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart?.cartItems || []);

  if (!product) {
    return (
      <button
        disabled
        className="opacity-50 cursor-not-allowed px-4 py-2 rounded-xl bg-gray-100 text-gray-400 font-medium text-sm"
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

  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch gap-3">
      {/* Add to Cart Button */}
      <motion.button
        whileTap={!isAdded && product.countInStock !== 0 ? { scale: 0.97 } : {}}
        transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.6 }}
        onClick={handleAddToCart}
        disabled={isAdded || product.countInStock === 0}
        className={`group relative flex items-center justify-center gap-2 px-4 py-3 font-semibold text-[13px] sm:text-sm uppercase tracking-wider rounded-xl border overflow-hidden transition-all duration-300 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A1A1A]
          ${
            isAdded
              ? "border-gray-200 text-gray-500 bg-gray-50 cursor-not-allowed"
              : "border-[#1A1A1A] text-[#1A1A1A] bg-white hover:bg-[#1A1A1A] focus-visible:ring-offset-white"
          } ${customStyles}`}
      >
        {!isAdded && (
          <span className="absolute inset-0 bg-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        <CiShoppingCart
          className={`relative z-10 text-lg transition-all duration-300 ${!isAdded ? "group-hover:text-white" : ""}`}
        />
        <span
          className={`relative z-10 transition-all duration-300 ${!isAdded ? "group-hover:text-white" : ""}`}
        >
          {isAdded ? addedText : buttonText}
        </span>
      </motion.button>

      {/* Order Now Button */}
      {isOrderNow && (
        <div className="flex-[1.5] flex flex-col">
          <motion.button
            whileHover={
              product.countInStock !== 0
                ? {
                    scale: 1.01,
                    boxShadow: "0 8px 24px -8px rgba(184, 142, 47, 0.5)",
                  }
                : {}
            }
            whileTap={product.countInStock !== 0 ? { scale: 0.98 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={handleOrderNow}
            disabled={product.countInStock === 0}
            className="group relative flex items-center justify-center px-5 py-3 bg-[#B88E2F] text-white rounded-xl font-semibold text-[13px] sm:text-sm uppercase tracking-wider transition-all duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed overflow-hidden shadow-md hover:bg-[#9a7828] outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B88E2F]"
          >
            <motion.span
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 pointer-events-none"
            />
            <span className="relative flex items-center gap-2 font-trebuchet">
              Order Now
              <FaLongArrowAltRight className="text-base group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </motion.button>

          {product.countInStock <= 5 && product.countInStock > 0 && (
            <p className="text-center text-[10px] sm:text-[11px] font-bold text-orange-600 mt-2 tracking-wide">
              Only {product.countInStock} units left!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
