/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import HeartIcon from "../../pages/Products/HeartIcon";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";

const Product = ({ product }) => {
  const dispatch = useDispatch();

  /* ── unchanged logic ──────────────────────────────────── */


  const getVariantPrice = (product) => {
    if (!product.hasVariants || !product.variants) return product?.price || 0;
    const colorIndex = product.defaultColorIndex || 0;
    const sizeIndex = product.defaultSizeIndex || 0;
    const variant = product.variants[colorIndex];
    if (!variant?.sizes?.[sizeIndex]) return product?.price || 0;
    return variant.sizes[sizeIndex].price;
  };

  const calculateEffectivePrice = (product, basePrice) => {
    const discountPercent = product?.discountPercentage || 0;
    if (discountPercent > 0)
      return basePrice - (basePrice * discountPercent) / 100;
    return basePrice;
  };

  const getMainImage = (product) => {
    if (!product.hasVariants || !product.variants?.length) {
      return Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : product?.image || "/placeholder.jpg";
    }
    const colorIndex = product.defaultColorIndex || 0;
    const variant = product.variants[colorIndex];
    return variant?.color?.image || product.images?.[0] || "/placeholder.jpg";
  };

  const basePrice = getVariantPrice(product);
  const finalPrice = calculateEffectivePrice(product, basePrice);
  const originalPrice = basePrice;
  const displayDiscountPercent = product.discountPercentage || 0;
  const mainImage = getMainImage(product);
  const productPath = `/product/${product.slug || product._id}`;

  const addToCartHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const colorIndex = product.defaultColorIndex || 0;
    const sizeIndex = product.defaultSizeIndex || 0;
    const variant = product.variants?.[colorIndex];
    const sizeVariant = variant?.sizes?.[sizeIndex];
    const productToAdd = {
      ...product,
      _id: product._id,
      name: product.name,
      price: originalPrice,
      finalPrice,
      _effectivePrice: finalPrice,
      effectivePrice: finalPrice,
      basePrice: originalPrice,
      _savings: originalPrice - finalPrice,
      savings: originalPrice - finalPrice,
      discountPercentage: product.discountPercentage,
      variantInfo: product.hasVariants
        ? {
            hasVariants: true,
            colorIndex,
            sizeIndex,
            colorName: variant?.color?.name || "",
            colorHex: variant?.color?.hexCode || "",
            sizeName: sizeVariant?.size || "",
            variantPrice: sizeVariant?.price || originalPrice,
            sku: sizeVariant?.sku || "",
          }
        : {
            hasVariants: false,
            colorIndex: null,
            sizeIndex: null,
            colorName: "",
            sizeName: "",
            variantPrice: null,
            sku: "",
          },
      weight: product.weight || 0.5,
      image: mainImage,
      qty: 1,
    };
    dispatch(addToCart(productToAdd));
    toast.success("Added to cart");
  };
  /* ── end unchanged logic ──────────────────────────────── */

  const inStock = product.countInStock > 0;

  return (
    <article
      itemScope
      itemType="https://schema.org/Product"
      className="group bg-white shadow-lg border transition-all duration-200 overflow-hidden flex flex-col h-full font-figtree"
    >
      <meta itemProp="brand" content={product?.brand || "AriX Co"} />
      <meta itemProp="name" content={product.name} />
      <meta
        itemProp="description"
        content={product?.description || product.name}
      />

      {/* ── Image ── */}
      <div className="relative aspect-square bg-[#FDF6EC] overflow-hidden shrink-0">
        <Link
          to={productPath}
          title={`View details of ${product.name}`}
          aria-label={`View ${product.name}`}
          className="block w-full h-full"
        >
          <img
            itemProp="image"
            src={mainImage}
            alt={`Buy ${product.name} online — AriX Co`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        </Link>

        {/* Discount badge */}
        {displayDiscountPercent > 0 && (
          <div
            aria-label={`${displayDiscountPercent}% discount`}
            className="absolute top-2 bg-[#6E2594] text-white text-[12px] font-normal font-trebuchet px-2 py-0.5"
          >
            -{displayDiscountPercent}%
          </div>
        )}

        {/* Out of stock */}
        {!inStock && (
          <div
            aria-label="Out of stock"
            className="absolute inset-0 bg-white/60 flex items-end justify-center pb-3"
          >
            <span className="text-[10px] font-bold uppercase font-trebuchet tracking-px text-rose-800 bg-white border border-[#EDE4D4] px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist */}
        <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-10">
          <HeartIcon product={product} />
        </div>
        {/* Add to cart — slide up, gold button */}
        {inStock && (
          <button
            onClick={addToCartHandler}
            aria-label={`Add ${product.name} to cart`}
            className="absolute bottom-0 left-0 w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 text-[14px] font-medium capitalize tracking-px font-trebuchet text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88E2F]"
            style={{
              background:"#6E2594",
              backgroundSize: "200% 100%",
            }}
          >
            <FaShoppingCart
              className="w-[11px] h-[11px] sm:w-[12px] sm:h-[12px] shrink-0"
              aria-hidden="true"
            />
            Add to Cart
          </button>
        )}
      </div>

      {/* ── Content ── */}
      <div className="px-3 pb-3 sm:px-3.5 flex flex-col grow border-t pt-4 border-gray-200">
        {/* Name */}
        <Link to={productPath} title={product.name} className="block mb-2">
          <h3
            itemProp="name"
            className="text-[15px] font-normal text-black tracking-px leading-snug line-clamp-2 hover:text-[#EF4A23] hover:underline transition-colors duration-150"
          >
            {product.name}
          </h3>
        </Link>

        <div className="grow" />

        {/* Price */}
        <div
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
          className="flex items-baseline gap-2 mt-1 pt-2"
        >
          <meta itemProp="priceCurrency" content="BDT" />
          <meta itemProp="price" content={finalPrice} />
          <meta
            itemProp="availability"
            content={
              inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock"
            }
          />

          <span
            className="text-[17px] font-semibold text-[#D51E0B] tracking-[.5px] font-trebuchet"
            aria-label={`Price: ৳${Math.round(finalPrice).toLocaleString("en-BD")}`}
          >
            {Math.round(finalPrice).toLocaleString("en-BD")}৳
          </span>

          {displayDiscountPercent > 0 && (
            <span
              className="text-[13px] font-normal font-trebuchet text-gray-700 line-through"
              aria-label={`Original price: ৳${originalPrice.toLocaleString("en-BD")}`}
            >
              {originalPrice.toLocaleString("en-BD")}৳
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default Product;
