// Helper function to add decimals
export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

export const updateCart = (state) => {
  // ✅ বাগ ফিক্স: reduce কল করার আগে নিশ্চিত করা হচ্ছে cartItems একটি ভ্যালিড অ্যারে কিনা
  const cartItems = Array.isArray(state?.cartItems) ? state.cartItems : [];

  let totalSavings = 0;

  state.itemsPrice = addDecimals(
    cartItems.reduce((acc, item) => {
      const finalPrice =
        Number(item._finalPrice) ||
        Number(item.finalPrice) ||
        Number(item.price) ||
        0;
      const qty = Number(item.qty) || 1;

      const basePrice = Number(item.basePrice) || finalPrice;
      const savingsPerItem = basePrice - finalPrice;
      totalSavings += savingsPerItem * qty;

      return acc + finalPrice * qty;
    }, 0),
  );

  const itemsPriceNum = Number(state.itemsPrice);

  // ✅ REMOVED: Hardcoded shipping calculation logic
  // Shipping is now calculated dynamically on the Checkout page based on Division/District/Thana

  state.shippingPrice = addDecimals(0); // Set to 0 in cart context
  state.taxPrice = addDecimals(0);

  // ✅ UPDATED: Total price in cart is now just items + tax (shipping added later at checkout)
  state.totalPrice = addDecimals(itemsPriceNum);

  state.totalSavings = addDecimals(totalSavings);

  localStorage.setItem("cart", JSON.stringify(state));
  return state;
};

// Add a product to a localStorage
export const addFavoriteToLocalStorage = (product) => {
  const favorites = getFavoritesFromLocalStorage();
  if (!favorites.some((p) => p._id === product._id)) {
    favorites.push(product);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
};

// Remove  product from a localStorage
export const removeFavoriteFromLocalStorage = (productId) => {
  const favorites = getFavoritesFromLocalStorage();
  const updateFavorites = favorites.filter(
    (product) => product._id !== productId,
  );

  localStorage.setItem("favorites", JSON.stringify(updateFavorites));
};

// Retrive favorites from a localStorage
export const getFavoritesFromLocalStorage = () => {
  const favoritesJSON = localStorage.getItem("favorites");
  return favoritesJSON ? JSON.parse(favoritesJSON) : [];
};
