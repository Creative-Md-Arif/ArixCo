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

  // ── আগের ফাংশনগুলো ১০০% unchanged ──
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

  // ── নতুন ক্যাম্পেইন লজিক (ভ্যারিয়েন্ট অনুযায়ী ক্যালকুলেশন সহ) ──
  const hasCampaign =
    product?.appliedCampaigns && product.appliedCampaigns.length > 0;

  // ভ্যারিয়েন্ট পরিবর্তনের সাথে সাথে ডায়নামিক্যালি ক্যাম্পেইন প্রাইস বের করার ফাংশন (শুধু UI এর জন্য)
  const getDynamicCampaignPrice = (currentBasePrice) => {
    if (!hasCampaign) return null;
    let calculatedPrice = currentBasePrice;

    for (const camp of product.appliedCampaigns) {
      let discountAmt =
        camp.discountType === "percentage"
          ? (calculatedPrice * camp.discountValue) / 100
          : camp.discountValue;

      if (camp.maxDiscountAmount) {
        discountAmt = Math.min(discountAmt, camp.maxDiscountAmount);
      }
      calculatedPrice -= discountAmt;
    }
    return Math.max(Math.round(calculatedPrice * 100) / 100, 0);
  };

  // ব্যাজের টেক্সট তৈরি (Type + Discount Amount)
  const getCampaignBadgeText = () => {
    if (!hasCampaign) return null;
    const camp = product.appliedCampaigns[0];
    // "flash_sale" -> "Flash Sale"
    const typeName = (camp.type || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const discountText =
      camp.discountType === "percentage"
        ? `-${camp.discountValue}%`
        : `-৳${camp.discountValue}`;
    return `${typeName} ${discountText}`;
  };

  // চূড়ান্ত ভ্যারিয়েবল
  const dynamicCampaignPrice = getDynamicCampaignPrice(basePrice);
  const priceToShow = hasCampaign ? dynamicCampaignPrice : finalPrice;
  const crossedPrice = basePrice; // সরাসরি বেস প্রাইস কাটা দেখাবে
  const campaignBadgeText = getCampaignBadgeText();

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
      price: basePrice,
      basePrice,
      finalPrice,
      campaignPrice: priceToShow, // ভ্যারিয়েন্ট অনুযায়ী ক্যাম্পেইন প্রাইস
      appliedCampaigns: product?.appliedCampaigns || [],
      variantInfo: getVariantInfo(),
      image: displayImages[0] || product.images[0],
      images: displayImages,
      _effectivePrice: priceToShow,
      effectivePrice: priceToShow,
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
    <div className="bg-white min-h-screen pt-10">
      <div className="container mx-auto mt-2 px-4">
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

      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* ── Image Gallery ── */}
          <div className="lg:w-[45%]">
            <div className="sticky top-20 sm:top-24 flex flex-col-reverse lg:flex-row gap-3 sm:gap-5">
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
                      className={`w-14 h-14 sm:w-[70px] sm:h-[70px] object-contain bg-white p-0.5 rounded-lg cursor-pointer transition-all duration-300 ${
                        activeImage === img
                          ? "ring-2 ring-neutral-950 scale-105"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="relative flex-1 bg-white rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-2 group">
                {/* আপডেটেড ব্যাজ (Type + Discount) */}
                {hasCampaign ? (
                  <div className="absolute top-4 left-0 z-10">
                    <div className="bg-red-600 border border-neutral-100 px-3 py-1.5 rounded-r-xl flex items-center gap-1.5">
                      <span className="text-[12px] sm:text-[14px] font-trebuchet font-bold uppercase tracking-px text-white">
                        {campaignBadgeText}
                      </span>
                    </div>
                  </div>
                ) : displayDiscountPercent > 0 ? (
                  <div className="absolute top-4 left-0 z-10">
                    <div className="bg-[#6E2594] border border-neutral-100 px-3 py-1 min-w-[120px] rounded-r-xl flex items-center gap-1.5">
                      <span className="text-[14px] font-trebuchet font-bold uppercase tracking-px text-white">
                        Save
                      </span>
                      <span className="text-sm font-medium font-trebuchet text-white tracking-px">
                        -{Math.round(displayDiscountPercent)}%
                      </span>
                    </div>
                  </div>
                ) : null}

                <img
                  src={activeImage}
                  alt="Product view"
                  className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="lg:w-[55%] space-y-4">
            <h1 className="text-[20px] md:text-[22px] font-normal font-trebuchet text-[#3749BB] tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <span className="text-[14px] font-trebuchet text-gray-600 font-normal">
                  Price:
                </span>
                <span className="text-[16px] font-trebuchet font-bold text-[#000000]">
                  {Math.round(priceToShow * qty).toLocaleString()}৳
                </span>
                {/* শুধুমাত্র বেস প্রাইস কাটা থাকবে */}
                {hasCampaign && (
                  <span className="text-[12px] text-gray-600 font-trebuchet font-semibold line-through ml-1">
                    {Math.round(crossedPrice * qty).toLocaleString()}৳
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <span className="text-[14px] font-trebuchet text-gray-600 font-normal">
                  Status:
                </span>
                <span
                  className={`text-[14px] font-trebuchet font-bold ${currentStock > 0 ? "text-[#000000]" : "text-red-500"}`}
                >
                  {currentStock > 0 ? `In Stock ` : "Out of Stock"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <span className="text-[14px] font-trebuchet text-gray-600 font-normal">
                  Brand:
                </span>
                <span className="text-[14px] font-trebuchet font-bold text-[#000000]">
                  {product.brand || "AriX co"}
                </span>
              </div>
            </div>

            {product.hasVariants && (
              <div className="flex items-center gap-1.5 font-playfair">
                <span className="text-[12px] font-bold text-black">Color:</span>
                <span className="text-[12px] font-black text-black">
                  {product.variants[selectedColorIndex]?.color?.name}
                </span>
                {product.variants[selectedColorIndex]?.sizes[selectedSizeIndex]
                  ?.size && (
                  <span className="text-[12px] text-gray-400 font-medium ml-1">
                    (
                    {
                      product.variants[selectedColorIndex]?.sizes[
                        selectedSizeIndex
                      ]?.size
                    }
                    )
                  </span>
                )}
              </div>
            )}

            {product.hasVariants && product.variants?.length > 0 && (
              <div className="pt-1 font-playfair">
                <div className="flex flex-wrap gap-1">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange(index)}
                      className={`px-3 py-1 text-[13px] transition-all duration-150 border uppercase tracking-wider ${
                        selectedColorIndex === index
                          ? "border-[#E04F23] bg-[#E04F23] text-white font-medium"
                          : "border-blue-700 bg-white text-black hover:bg-gray-50 font-normal"
                      }`}
                    >
                      {variant.color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.hasVariants &&
              product.variants[selectedColorIndex]?.sizes?.length > 0 && (
                <div className="pt-3 font-playfair">
                  <div className="flex flex-wrap gap-1">
                    {product.variants[selectedColorIndex].sizes.map(
                      (size, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSizeIndex(index)}
                          disabled={size.countInStock === 0}
                          className={`px-3 py-1 text-[13px] transition-all duration-150 border min-w-[40px] ${
                            selectedSizeIndex === index
                              ? "border-[#E04F23] bg-[#E04F23] text-white font-medium"
                              : size.countInStock === 0
                                ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                                : "border-blue-700 bg-white text-black hover:bg-gray-50 font-normal"
                          }`}
                        >
                          {size.size}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}

            {product.specifications?.length > 0 && (
              <div className="pt-2">
                <h4 className="text-[18px] font-normal font-trebuchet tracking-wide text-[#1A1A1A] mb-2">
                  Key Features
                </h4>
                <div className="space-y-2">
                  {product.specifications.slice(0, 5).map((spec, idx) => (
                    <div key={idx} className="flex gap-1">
                      <span className="text-[15px] font-normal font-trebuchet text-[#000000] capitalize min-w-[80px] sm:min-w-[120px]">
                        {spec.label}
                      </span>
                      <span className="text-[15px] font-normal font-trebuchet text-[#000000] capitalize">
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
                    className="mt-3 text-red-500 font-trebuchet text-[15px] font-medium underline decoration-[#B88E2F]/40 underline-offset-4 hover:decoration-[#B88E2F] hover:text-red-600 transition-all duration-200"
                  >
                    View More Info →
                  </button>
                )}
              </div>
            )}

            <div className="pt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <div className="flex items-center border border-gray-200 bg-white h-8 w-24 font-playfair select-none rounded-[4px] overflow-hidden flex-shrink-0">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-full flex items-center justify-center bg-gray-50 text-black text-[14px] font-medium border-r border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    —
                  </button>
                  <span className="flex-1 h-full flex items-center justify-center text-[13px] font-medium text-black bg-white">
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty(Math.min(currentStock || 10, qty + 1))
                    }
                    disabled={qty >= currentStock}
                    className="w-8 h-full flex items-center justify-center bg-white text-black text-[14px] font-medium border-l border-gray-100 hover:bg-gray-50 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                <div className="flex-1 sm:w-[110px] sm:flex-initial h-8">
                  <AddToCartButton
                    product={getProductForCart()}
                    qty={qty}
                    buttonText="Add"
                    addedText="Added"
                    variant="add"
                    customStyles="h-8 !rounded-[4px]"
                  />
                </div>
              </div>

              <div className="flex-1 sm:w-[110px] sm:flex-initial h-8">
                <AddToCartButton
                  product={getProductForCart()}
                  qty={qty}
                  isOrderNow={true}
                  variant="order"
                  customStyles="h-8 !rounded-[4px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F9F9F9] py-6">
        <div id="product-tabs-section" className="container mx-auto px-4 mt-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <div className="flex-1 min-w-0 w-full">
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

            <div className="w-full lg:w-[300px] flex-shrink-0">
              <div className="bg-white border border-neutral-200 rounded-[4px] overflow-hidden">
                <div className="px-4 py-3.5 border-b border-neutral-200 bg-white">
                  <h2
                    className="text-[16px] font-bold text-[#2031B8] text-center"
                    style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
                  >
                    Similar Product
                  </h2>
                </div>

                {relatedLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-[76px] bg-gray-100 rounded-[4px] animate-pulse"
                      />
                    ))}
                  </div>
                ) : relatedError ? (
                  <div className="p-4">
                    <Message variant="danger">
                      Failed to load related products
                    </Message>
                  </div>
                ) : relatedProducts?.length > 0 ? (
                  <div className="px-4 divide-y divide-neutral-100">
                    {relatedProducts
                      .slice(0, 5)
                      .map((relatedProduct, index) => (
                        <motion.div
                          key={relatedProduct._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.06 }}
                        >
                          <ProductCard p={relatedProduct} viewMode="similar" />
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4">
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
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
