/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";
import { updateCart } from "../../../Utils/cart";

// ✅ বাগ ফিক্স: Duplicate keys এরর সমাধান করে ক্লিন কোড
const getInitialState = () => {
  try {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      const parsedCart = JSON.parse(cartData);
      return {
        cartItems: Array.isArray(parsedCart.cartItems)
          ? parsedCart.cartItems
          : [],
        shippingAddress: parsedCart.shippingAddress || {},
        paymentMethod: parsedCart.paymentMethod || "Cash on Delivery",
        itemsPrice: parsedCart.itemsPrice || 0,
        shippingPrice: 0, // ✅ No longer managed by Redux, always 0 here
        taxPrice: parsedCart.taxPrice || 0,
        totalPrice: parsedCart.itemsPrice || 0, // ✅ totalPrice = Subtotal only (items + tax)
        totalSavings: parsedCart.totalSavings || 0,
      };
    }
  } catch (error) {
    console.error("Failed to parse cart from localStorage:", error);
  }

  return {
    cartItems: [],
    shippingAddress: {},
    paymentMethod: "Cash on Delivery",
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
    totalSavings: 0,
  };
};

const initialState = getInitialState();

// Helper to check if two items are the same (including variants)
const isSameItem = (item1, item2) => {
  if (item1._id !== item2._id) return false;

  if (item1.variantInfo?.hasVariants && item2.variantInfo?.hasVariants) {
    return (
      item1.variantInfo.colorIndex === item2.variantInfo.colorIndex &&
      item1.variantInfo.sizeIndex === item2.variantInfo.sizeIndex
    );
  }

  if (!item1.variantInfo?.hasVariants && !item2.variantInfo?.hasVariants) {
    return true;
  }

  return false;
};

// Simplified item price normalizer (Standard discount only)
const normalizeItemPrices = (item) => {
  if (!item) return null;

  const price = Number(item.price) || 0;
  const basePrice = Number(item.basePrice) || price || 0;

  let finalPrice = price || basePrice;
  let appliedDiscountPercent = 0;
  let savings = 0;

  if (item.discountPercentage) {
    appliedDiscountPercent = Number(item.discountPercentage) || 0;
    finalPrice = basePrice - (basePrice * appliedDiscountPercent) / 100;
    savings = (basePrice * appliedDiscountPercent) / 100;
  }

  return {
    ...item,
    price: price,
    basePrice: basePrice,
    _finalPrice: finalPrice,
    finalPrice: finalPrice,
    _effectivePrice: finalPrice,
    effectivePrice: finalPrice,
    _savings: savings,
    savings: savings,
    discountPercentage: appliedDiscountPercent,
    appliedDiscountPercent: appliedDiscountPercent,
    weight: Number(item.weight) || 0.5,
  };
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      if (!item || !item._id) {
        console.error("Invalid item:", item);
        return state;
      }

      const normalizedItem = normalizeItemPrices(item);

      const existItemIndex = state.cartItems.findIndex((x) =>
        isSameItem(x, normalizedItem),
      );

      if (existItemIndex !== -1) {
        state.cartItems[existItemIndex].qty = normalizedItem.qty;
        state.cartItems[existItemIndex] = {
          ...state.cartItems[existItemIndex],
          _finalPrice: normalizedItem._finalPrice,
          finalPrice: normalizedItem.finalPrice,
          _effectivePrice: normalizedItem._effectivePrice,
          effectivePrice: normalizedItem.effectivePrice,
          basePrice: normalizedItem.basePrice,
          _savings: normalizedItem._savings,
          savings: normalizedItem.savings,
          discountPercentage: normalizedItem.discountPercentage,
          appliedDiscountPercent: normalizedItem.appliedDiscountPercent,
          weight: normalizedItem.weight,
        };
      } else {
        state.cartItems.push(normalizedItem);
      }

      // ✅ Removed state.shippingAddress parameter, no longer needed for price calc
      return updateCart(state);
    },

    removeFromCart: (state, action) => {
      const { _id, variantInfo } = action.payload;

      if (!_id) {
        console.error("Invalid item ID provided for removal", action.payload);
        return state;
      }

      state.cartItems = state.cartItems.filter((item) => {
        if (item._id !== _id) return true;

        if (variantInfo?.hasVariants) {
          const itemHasVariants = item.variantInfo?.hasVariants;
          if (!itemHasVariants) return true;

          const colorMatch =
            item.variantInfo?.colorIndex === variantInfo.colorIndex;
          const sizeMatch =
            item.variantInfo?.sizeIndex === variantInfo.sizeIndex;

          return !(colorMatch && sizeMatch);
        }

        return false;
      });

      // ✅ Removed state.shippingAddress parameter
      return updateCart(state);
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      // ✅ Shipping address saves, but DOES NOT trigger shipping price calculation here anymore
      localStorage.setItem("cart", JSON.stringify(state));
      return state;
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem("cart", JSON.stringify(state));
    },

    clearCartItems: (state) => {
      state.cartItems = [];
      state.itemsPrice = 0;
      state.shippingPrice = 0;
      state.taxPrice = 0;
      state.totalPrice = 0;
      state.totalSavings = 0;
      localStorage.setItem("cart", JSON.stringify(state));
    },

    resetCart: (state) => {
      localStorage.removeItem("cart");
      return {
        cartItems: [],
        shippingAddress: {},
        paymentMethod: "Cash on Delivery",
        itemsPrice: 0,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: 0,
        totalSavings: 0,
      };
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
