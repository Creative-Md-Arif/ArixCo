import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaArrowRight,
  FaPlus,
  FaMinus,
  FaTag,
  FaInfoCircle,
} from "react-icons/fa";
import {
  addToCart,
  removeFromCart,
  toggleCartSidebar,
} from "../redux/features/cart/cartSlice";
import { LuShoppingBag } from "react-icons/lu";
import { FaArrowRightLong } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";


const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const cart = useSelector((state) => state.cart) || {};
  const { cartItems = [], isCartOpen = false } = cart;

  

  const addToCartHandler = (product, qty) => {
    const cartItem = {
      ...product,
      qty,
      discountPercentage: product.discountPercentage,
      weight: product.weight,
      variantInfo: product.variantInfo,
    };
    dispatch(addToCart(cartItem));
  };

  const removeFromCartHandler = (item) => {
    dispatch(
      removeFromCart({
        _id: item._id,
        variantInfo: item.variantInfo || null,
      }),
    );
  };

  const closeCartSidebar = () => {
    dispatch(toggleCartSidebar(false));
  };

  const checkoutHandler = () => {
    closeCartSidebar();
    if (userInfo) {
      navigate("/shipping");
    } else {
      navigate("/login?redirect=/shipping");
    }
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const finalPrice =
      Number(item.finalPrice) || Number(item._finalPrice) || item.price || 0;
    return acc + finalPrice * item.qty;
  }, 0);

  const totalSavings = cartItems.reduce((acc, item) => {
    const basePrice = Number(item.basePrice) || Number(item.price) || 0;
    const finalPrice =
      Number(item.finalPrice) || Number(item._finalPrice) || item.price || 0;
    const savingsPerItem = basePrice - finalPrice;
    return acc + savingsPerItem * item.qty;
  }, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        // Fixed overlay wrapper (Absolute positioning used for stability)
        <div className="fixed inset-0 z-[1500]">
          {/* Left Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
            onClick={closeCartSidebar}
          ></motion.div>

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="absolute right-0 top-0 bottom-0 w-full sm:max-w-[420px] md:max-w-[460px] h-full bg-[#F9F9F9] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Sidebar Header */}
            <div className="flex-shrink-0 py-4 sm:py-5 px-4 sm:px-6 bg-white border-b border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <h1 className="text-lg sm:text-xl font-bold border-l-4 border-red-600 pl-3 text-gray-800 uppercase tracking-widest font-mono">
                  Shopping <span className="text-red-600">Bag</span>
                </h1>
              </div>
              <button
                onClick={closeCartSidebar}
                className="p-2 text-gray-400 hover:text-red-600 transition-all"
              >
                <IoMdClose size={24} />
              </button>
            </div>

            {/* Sidebar Scrollable Body - Fixed layout shift bug */}
            <div className="flex-1 overflow-y-auto flex flex-col p-3 sm:p-4">
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm py-20 px-4">
                  <LuShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
                  <h2 className="text-lg sm:text-xl font-mono font-black text-gray-800 uppercase tracking-tighter mb-6 text-center">
                    Shopping Bag Empty
                  </h2>
                  <Link to="/shop" onClick={closeCartSidebar}>
                    <button className="flex items-center gap-2 bg-black text-white py-3 px-6 rounded-xl font-mono font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-red-600 transition-all shadow-lg">
                      Go to Shop <FaArrowRight />
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item) => {
                      const finalPrice =
                        Number(item.finalPrice) ||
                        Number(item._finalPrice) ||
                        item.price ||
                        0;
                      const basePrice =
                        Number(item.basePrice) || Number(item.price) || 0;
                      const savingsPerItem = basePrice - finalPrice;
                      const discountPercent = item.discountPercentage || 0;

                      const variantText = item.variantInfo?.hasVariants
                        ? `${item.variantInfo.colorName} / ${item.variantInfo.sizeName}`
                        : "";

                      return (
                        <motion.div
                          key={`${item._id}-${item.variantInfo?.colorIndex}-${item.variantInfo?.sizeIndex}`}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3 sm:gap-4 items-start group hover:border-red-200 transition-all duration-300"
                        >
                          {/* Item Image */}
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={
                                item.image || (item.images && item.images[0])
                              }
                              alt={item.name}
                              className="w-full h-full object-contain p-1.5"
                            />
                            {discountPercent > 0 && (
                              <div className="absolute top-0 right-0 text-white text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-bl-lg bg-red-600">
                                {Math.round(discountPercent)}%
                              </div>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div>
                              <h3 className="text-xs sm:text-sm font-mono font-black text-gray-900 uppercase truncate group-hover:text-red-600 transition-colors">
                                {item.name}
                              </h3>

                              {item.variantInfo?.hasVariants && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-gray-200"
                                    style={{
                                      backgroundColor:
                                        item.variantInfo.colorHex,
                                    }}
                                  />
                                  <span className="text-[9px] sm:text-[11px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded truncate">
                                    {variantText}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-red-600 text-xs sm:text-sm font-black font-mono">
                                  ৳ {finalPrice.toLocaleString()}
                                </span>
                                {savingsPerItem > 0 && (
                                  <span className="text-gray-400 text-[10px] sm:text-xs line-through">
                                    ৳{Number(basePrice).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Bottom Section: Qty & Total */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                                <button
                                  onClick={() =>
                                    item.qty > 1 &&
                                    addToCartHandler(item, item.qty - 1)
                                  }
                                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md hover:bg-white hover:text-red-600 transition-all"
                                >
                                  <FaMinus size={8} />
                                </button>
                                <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-mono font-black">
                                  {item.qty}
                                </span>
                                <button
                                  onClick={() =>
                                    addToCartHandler(item, item.qty + 1)
                                  }
                                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md hover:bg-white hover:text-red-600 transition-all"
                                >
                                  <FaPlus size={8} />
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-mono font-black text-gray-900 tracking-tighter">
                                  ৳ {(item.qty * finalPrice).toFixed()}
                                </span>
                                <button
                                  onClick={() => removeFromCartHandler(item)}
                                  className="text-gray-300 hover:text-red-600 transition-all"
                                >
                                  <IoMdClose size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Sidebar Sticky Footer / Summary */}
            {cartItems.length > 0 && (
              <div className="flex-shrink-0 border-t border-gray-100 bg-white">
                <div className="bg-black text-white p-4 sm:p-6 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                  <h3 className="text-sm sm:text-base font-bold mb-4 border-l-4 border-red-600 pl-3 uppercase tracking-wider font-mono">
                    Order Summary
                  </h3>

                  <div className="space-y-2 font-mono text-xs sm:text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Original Subtotal</span>
                      <span className="text-white">
                        ৳{(subtotal + totalSavings).toFixed()}
                      </span>
                    </div>

                    {totalSavings > 0 && (
                      <div className="flex justify-between text-green-500 bg-green-500/10 p-2 rounded-lg border border-green-500/20 text-[10px] sm:text-xs">
                        <span className="flex items-center gap-1.5 font-black uppercase">
                          <FaTag size={10} /> Savings
                        </span>
                        <span className="font-black">
                          - ৳{totalSavings.toFixed()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-500">
                      <span>Discounted Subtotal</span>
                      <span className="text-white font-bold">
                        ৳{subtotal.toFixed()}
                      </span>
                    </div>

                    <p className="text-[8px] sm:text-[9px] text-gray-600 text-right italic">
                      Shipping & taxes calculated at checkout
                    </p>

                    <div className="h-px bg-gray-800 my-3" />

                    <div className="flex justify-between items-center">
                      <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-black">
                        Subtotal
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-red-600 tracking-tighter">
                        ৳{subtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={cartItems.length === 0}
                    onClick={checkoutHandler}
                    className="w-full group mt-5 sm:mt-6 flex items-center justify-center gap-2 sm:gap-3 bg-red-600 py-3 sm:py-4 rounded-xl font-mono font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-white hover:text-black transition-all duration-500 shadow-xl"
                  >
                    Checkout{" "}
                    <FaArrowRightLong className="group-hover:translate-x-2 transition-transform" />
                  </button>

                  <p className="mt-3 sm:mt-4 text-[8px] sm:text-[9px] text-center text-gray-600 uppercase tracking-widest font-bold flex items-center justify-center gap-1.5">
                    <FaInfoCircle size={10} /> Verified Secure Checkout
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Cart;
