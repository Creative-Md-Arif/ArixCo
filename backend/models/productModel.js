import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;
import slugify from "slugify";

// Review Schema
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Variant Schema - For Color/Size combinations
const variantSchema = mongoose.Schema({
  color: {
    name: { type: String, required: true },
    hexCode: { type: String, default: "" },
    image: { type: String, required: true },
    images: [{ type: String }],
  },
  sizes: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true },
      countInStock: { type: Number, required: true, default: 0 },
      sku: { type: String, default: "" },
      isAvailable: { type: Boolean, default: true },
    },
  ],
  isActive: { type: Boolean, default: true },
});

// Product Schema
const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, lowercase: true },
    images: [{ type: String, required: true }],
    brand: { type: String, required: true },
    quantity: { type: Number, required: true },
    category: { type: ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    keyFeatures: [{ type: String }],
    specifications: [
      {
        label: String,
        value: String,
      },
    ],
    descriptionImages: [{ type: String }],
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    offer: { type: String, default: "" },
    warranty: { type: String, default: "" },
    discountedAmount: { type: Number, default: 0 },
    weight: { type: Number, default: 0.5 },

    // ====== NEW: Product Wise Shipping Details ======
    shippingDetails: {
      isFreeShipping: { type: Boolean, default: false },
      isIndividualShipping: { type: Boolean, default: false },
      individualShippingCost: { type: Number, default: 0 }, 
      extraShippingCost: { type: Number, default: 0 }, 
    },

    hasVariants: { type: Boolean, default: false },
    variants: [variantSchema],

    defaultColorIndex: { type: Number, default: 0 },
    defaultSizeIndex: { type: Number, default: 0 },

    salesCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  if (this.hasVariants && this.variants && this.variants.length > 0) {
    let totalStock = 0;
    this.variants.forEach((variant) => {
      if (variant.sizes && variant.sizes.length > 0) {
        variant.sizes.forEach((size) => {
          totalStock += size.countInStock || 0;
        });
      }
    });
    this.countInStock = totalStock;
  }

  next();
});

productSchema.methods.getVariantPrice = function (colorIndex, sizeIndex) {
  if (!this.hasVariants || !this.variants[colorIndex]) {
    return this.price;
  }
  const variant = this.variants[colorIndex];
  if (!variant.sizes || !variant.sizes[sizeIndex]) {
    return this.price;
  }
  return variant.sizes[sizeIndex].price;
};

productSchema.methods.getVariantStock = function (colorIndex, sizeIndex) {
  if (!this.hasVariants || !this.variants[colorIndex]) {
    return this.countInStock;
  }
  const variant = this.variants[colorIndex];
  if (!variant.sizes || !variant.sizes[sizeIndex]) {
    return 0;
  }
  return variant.sizes[sizeIndex].countInStock;
};

productSchema.methods.getColorImages = function (colorIndex) {
  if (!this.hasVariants || !this.variants[colorIndex]) {
    return this.images;
  }
  const variant = this.variants[colorIndex];
  return variant.color.images && variant.color.images.length > 0
    ? variant.color.images
    : [variant.color.image];
};

productSchema.methods.getEffectivePrice = function () {
  if (this.discountPercentage > 0) {
    return this.price - (this.price * this.discountPercentage) / 100;
  }
  return this.price;
};

productSchema.index({
  name: "text",
  brand: "text",
  description: "text",
});


const Product = mongoose.model("Product", productSchema);

export default Product;
