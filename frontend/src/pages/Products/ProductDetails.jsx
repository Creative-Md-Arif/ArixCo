import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useGetRelatedProductsQuery,
} from "@redux/api/productApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import ProductTabs from "./ProductTabs";
import ProductCard from "./ProductCard";
import { FaPlus, FaMinus, FaCheck } from "react-icons/fa";
import AddToCartButton from "../../components/AddToCartButton";
import { motion } from "framer-motion";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";

const ProductDetails = () => {
  const { id: productId } = useParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const {
    data: relatedProducts,
    isLoading: relatedLoading,
    error: relatedError,
  } = useGetRelatedProductsQuery(
    { productId: product?._id, limit: 5 },
    { skip: !product?._id },
  );

  const { userInfo } = useSelector((state) => state.auth);
  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  useEffect(() => {
    if (product) {
      if (product.defaultColorIndex !== undefined)
        setSelectedColorIndex(product.defaultColorIndex);
      if (product.defaultSizeIndex !== undefined)
        setSelectedSizeIndex(product.defaultSizeIndex);
      if (!activeImage) {
        if (product.images?.length > 0) setActiveImage(product.images[0]);
        else if (product.image) setActiveImage(product.image);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const getDisplayImages = () => {
    if (!product) return [];
    const isVariantSelected = product.variants?.some(
      (v, idx) =>
        idx === selectedColorIndex &&
        (v.color.images?.includes(activeImage) ||
          v.color.image === activeImage),
    );
    if (isVariantSelected && product.variants[selectedColorIndex]) {
      const variant = product.variants[selectedColorIndex];
      if (variant.color.images?.length > 0) return variant.color.images;
      if (variant.color.image) return [variant.color.image];
    }
    return product.images?.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    let basePrice = product.price || 0;
    if (product.hasVariants && product.variants?.[selectedColorIndex]) {
      const variant = product.variants[selectedColorIndex];
      if (variant.sizes?.[selectedSizeIndex])
        basePrice = variant.sizes[selectedSizeIndex].price;
    }
    const discountPercent = product.discountPercentage || 0;
    if (discountPercent > 0)
      return basePrice - (basePrice * discountPercent) / 100;
    return basePrice;
  };

  const getCurrentStock = () => {
    if (!product) return 0;
    if (product.hasVariants && product.variants?.[selectedColorIndex]) {
      const variant = product.variants[selectedColorIndex];
      if (variant.sizes?.[selectedSizeIndex])
        return variant.sizes[selectedSizeIndex].countInStock;
    }
    return product.countInStock || 0;
  };

  const getVariantInfo = () => {
    if (!product || !product.hasVariants)
      return {
        hasVariants: false,
        colorIndex: null,
        colorName: "",
        colorHex: "",
        sizeIndex: null,
        sizeName: "",
        variantPrice: null,
        sku: "",
        countInStock: 0,
      };
    const variant = product.variants[selectedColorIndex];
    const size = variant?.sizes?.[selectedSizeIndex];
    return {
      hasVariants: true,
      colorIndex: selectedColorIndex,
      colorName: variant?.color?.name || "",
      colorHex: variant?.color?.hexCode || "",
      sizeIndex: selectedSizeIndex,
      sizeName: size?.size || "",
      variantPrice: size?.price || product.price,
      sku: size?.sku || "",
      countInStock: size?.countInStock || 0,
    };
  };

  const basePrice = product?.hasVariants
    ? product.variants?.[selectedColorIndex]?.sizes?.[selectedSizeIndex]
        ?.price || product.price
    : product?.price || 0;
  const finalPrice = getCurrentPrice();
  const currentStock = getCurrentStock();
  const displayImages = getDisplayImages();
  const displayDiscountPercent = product?.discountPercentage || 0;

  const handleColorChange = (index) => {
    setSelectedColorIndex(index);
    if (product.variants[index]?.sizes?.length > 0) setSelectedSizeIndex(0);
    const variant = product.variants[index];
    if (variant?.color?.images?.length > 0)
      setActiveImage(variant.color.images[0]);
    else if (variant?.color?.image) setActiveImage(variant.color.image);
  };

  const getProductForCart = () => {
    if (!product) return null;
    return {
      _id: product._id,
      name: product.name,
      price: finalPrice,
      basePrice,
      finalPrice,
      variantInfo: getVariantInfo(),
      image: displayImages[0] || product.images[0],
      images: displayImages,
      _effectivePrice: finalPrice,
      effectivePrice: finalPrice,
      discountPercentage: product.discountPercentage,
      qty,
      countInStock: currentStock,
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({ productId: product._id, rating, comment }).unwrap();
      refetch();
      toast.success("Review submitted");
      setComment("");
      setRating(0);
    } catch (error) {
      toast.error(error?.data?.message || "Error");
    }
  };

  const getCategoryHierarchy = (category) => {
    const hierarchy = [];
    let current = category;
    while (current) {
      hierarchy.unshift(current);
      current = current.parent;
    }
    return hierarchy;
  };

  const categoryHierarchy = product?.category
    ? getCategoryHierarchy(product.category)
    : [];

  if (isLoading) return <Loader />;
  if (error) return <Message variant="danger">{error?.data?.message}</Message>;

  return (
    <div className="bg-white min-h-screen font-figtree selection:bg-[#1A1A1A] selection:text-white px-3 sm:px-4">
      <div className="container mx-auto mt-2 border-b border-gray-200">
        <Breadcrumb
          items={[
            { label: "Shop", href: "/shop" },
            ...categoryHierarchy.map((cat, i, arr) => ({
              label: cat.name,
              href: `/shop?category=${cat._id}`,
              type: "category",
              isLeaf: i === arr.length - 1,
            })),
            { label: product.name },
          ]}
        />
      </div>

      <div className="container mx-auto py-6 sm:py-10 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* ── Image Gallery ── */}
          <div className="lg:w-[45%]">
            <div className="sticky top-20 sm:top-24 flex flex-col-reverse lg:flex-row gap-3 sm:gap-5">
              {/* Thumbnails */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto no-scrollbar py-1 lg:max-h-[520px] flex-shrink-0">
                {displayImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative flex-shrink-0 group/thumb"
                  >
                    <img
                      src={img}
                      alt="thumbnail"
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 sm:w-[70px] sm:h-[70px] object-cover rounded-lg cursor-pointer border-2 transition-all duration-300 ${
                        activeImage === img
                          ? "border-[#1A1A1A] scale-105"
                          : "border-gray-200 opacity-60 grayscale group-hover/thumb:grayscale-0 group-hover/thumb:opacity-100 hover:border-gray-400"
                      }`}
                    />
                    {activeImage === img && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#1A1A1A] rounded-r-full hidden lg:block"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Main Image */}
              <div className="relative flex-1 bg-[#F9F9F9] rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-4 sm:p-8 border border-gray-200 group">
                {displayDiscountPercent > 0 && (
                  <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-10">
                    <div className="bg-white border border-gray-200 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg flex flex-col items-center">
                      <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-widest text-gray-500">
                        Offer
                      </span>
                      <span className="text-base sm:text-xl font-black text-[#1A1A1A]">
                        -{Math.round(displayDiscountPercent)}%
                      </span>
                    </div>
                  </div>
                )}

                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  src={activeImage}
                  className="max-h-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />

                <div className="absolute bottom-3 sm:bottom-5 flex flex-col items-center gap-1 opacity-40">
                  <div className="w-8 h-[2px] bg-gray-300 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                      }}
                      className="w-full h-full bg-gray-500"
                    />
                  </div>
                  <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.3em] text-gray-500">
                    AriX GeaR
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="lg:w-[55%] space-y-4 sm:space-y-6">
            {/* Title */}
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#111827] leading-snug tracking-tight">
              {product.name}
            </h1>

            {/* Variant Label */}
            {product.hasVariants && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                  Selected:
                </span>
                <span className="text-[10px] sm:text-[12px] font-semibold text-[#1A1A1A] bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                  {product.variants[selectedColorIndex]?.color?.name} /{" "}
                  {
                    product.variants[selectedColorIndex]?.sizes[
                      selectedSizeIndex
                    ]?.size
                  }
                </span>
              </div>
            )}

            {/* Info Badges */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 sm:py-2 rounded-lg">
                <span className="text-[10px] sm:text-[13px] text-gray-600 font-medium">
                  Price:
                </span>
                <span className="text-[12px] sm:text-[16px] font-bold text-[#1A1A1A]">
                  ৳{Math.round(finalPrice * qty).toLocaleString()}
                </span>
                {displayDiscountPercent > 0 && (
                  <span className="text-[10px] sm:text-[12px] text-gray-400 line-through ml-1">
                    ৳{Math.round(basePrice * qty).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 sm:py-2 rounded-lg">
                <span className="text-[10px] sm:text-[13px] text-gray-600 font-medium">
                  Status:
                </span>
                <span
                  className={`text-[10px] sm:text-[13px] font-bold ${currentStock > 0 ? "text-emerald-600" : "text-red-500"}`}
                >
                  {currentStock > 0
                    ? `In Stock (${currentStock})`
                    : "Out of Stock"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 sm:py-2 rounded-lg">
                <span className="text-[10px] sm:text-[13px] text-gray-600 font-medium">
                  Brand:
                </span>
                <span className="text-[10px] sm:text-[13px] font-bold text-[#1A1A1A]">
                  {product.brand || "AriX GeaR"}
                </span>
              </div>
            </div>

            {/* Color Selection */}
            {product.hasVariants && product.variants?.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <h4 className="text-[10px] sm:text-[12px] font-bold text-gray-800 uppercase tracking-widest">
                  Select Color
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange(index)}
                      className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 transition-all duration-200 text-[10px] sm:text-[12px] font-semibold ${
                        selectedColorIndex === index
                          ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                          : "border-gray-200 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50 active:scale-95"
                      }`}
                    >
                      <span
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-gray-300 flex-shrink-0"
                        style={{
                          backgroundColor: variant.color.hexCode || "#ccc",
                        }}
                      />
                      {variant.color.name}
                      {selectedColorIndex === index && (
                        <FaCheck className="text-[8px] ml-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.hasVariants &&
              product.variants[selectedColorIndex]?.sizes?.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-[10px] sm:text-[12px] font-bold text-gray-800 uppercase tracking-widest">
                    Select Size
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.variants[selectedColorIndex].sizes.map(
                      (size, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSizeIndex(index)}
                          disabled={size.countInStock === 0}
                          className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 transition-all duration-200 min-w-[48px] sm:min-w-[56px] text-[10px] sm:text-[12px] font-semibold ${
                            selectedSizeIndex === index
                              ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                              : size.countInStock === 0
                                ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                                : "border-gray-200 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50 active:scale-95"
                          }`}
                        >
                          {size.size}
                          {selectedSizeIndex === index && (
                            <FaCheck className="text-[7px] absolute -top-1.5 -right-1.5 bg-[#B88E2F] text-white rounded-full p-0.5" />
                          )}
                          {size.countInStock === 0 && (
                            <span className="text-[6px] sm:text-[7px] block text-gray-400 normal-case">
                              Out
                            </span>
                          )}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* Key Features */}
            {product.specifications?.length > 0 && (
              <div className="pt-2">
                <h4 className="text-sm sm:text-lg font-bold text-[#1A1A1A] mb-3">
                  Key Features
                </h4>
                <div className="space-y-2 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                  {product.specifications.slice(0, 5).map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex items-baseline gap-3 border-b border-gray-200 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-[9px] sm:text-[12px] font-semibold text-gray-500 uppercase min-w-[80px] sm:min-w-[120px]">
                        {spec.label}
                      </span>
                      <span className="text-[10px] sm:text-[13px] font-medium text-gray-900">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
                {product.specifications.length > 5 && (
                  <button
                    onClick={() =>
                      document
                        .getElementById("product-tabs-section")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="mt-3 text-[#B88E2F] text-[10px] sm:text-[13px] font-semibold hover:underline underline-offset-4 decoration-[#B88E2F]/50 transition-all"
                  >
                    View More Info →
                  </button>
                )}
              </div>
            )}

 
            {/* Qty + Add to Cart + Order Now */}
            <div className="pt-4 border-t border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              {/* Row 1: Qty & Add to Cart (Side by side on Mobile & Desktop) */}
              <div className="flex items-stretch gap-3 flex-1">
                <div className="flex items-center bg-white rounded-xl border-2 border-gray-300 px-1.5 py-1 sm:px-2 sm:py-1">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <FaMinus size={10} />
                  </button>
                  <span className="w-7 sm:w-8 text-center text-sm font-semibold text-[#1A1A1A]">
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty(Math.min(currentStock || 10, qty + 1))
                    }
                    disabled={qty >= currentStock}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                  >
                    <FaPlus size={10} />
                  </button>
                </div>

                <div className="flex-1">
                  <AddToCartButton
                    product={getProductForCart()}
                    qty={qty}
                    buttonText="Add to Cart"
                    variant="add" // Renders only Add to Cart button
                    className="w-full py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 bg-[#B88E2F] hover:bg-[#9a7828] text-white border-[#B88E2F] active:scale-[0.98]"
                  />
                </div>
              </div>

              {/* Row 2: Order Now (Full width on Mobile, inline on Desktop) */}
              <div className="sm:flex-1">
                <AddToCartButton
                  product={getProductForCart()}
                  qty={qty}
                  isOrderNow={true}
                  variant="order" // Renders only Order Now button
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div
          id="product-tabs-section"
          className="mt-12 sm:mt-20 pt-8 sm:pt-14 border-t border-gray-200"
        >
          <ProductTabs
            {...{
              loadingProductReview,
              userInfo,
              submitHandler,
              rating,
              setRating,
              comment,
              setComment,
              product,
            }}
          />
        </div>

        {/* Related Products */}
        <div className="mt-12 sm:mt-20 pt-8 sm:pt-14 border-t border-gray-200">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-3 text-[#1A1A1A]">
              <span className="w-1.5 h-6 bg-[#B88E2F] rounded-full" /> Related
              Products
            </h2>
            <p className="text-gray-500 text-[10px] sm:text-sm mt-2 ml-4">
              More products you might be interested in
            </p>
          </div>

          {relatedLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-[300px] sm:h-[400px] bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : relatedError ? (
            <Message variant="danger">Failed to load related products</Message>
          ) : relatedProducts?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <ProductCard p={relatedProduct} viewMode="grid" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-600 font-medium text-sm">
                No related products found
              </p>
              <Link
                to="/shop"
                className="text-[#B88E2F] font-semibold mt-2 inline-block hover:underline text-xs sm:text-sm"
              >
                Browse all products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
