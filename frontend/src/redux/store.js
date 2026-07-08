import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./api/apiSlice";

// ✅ শুধুমাত্র এই লাইনটি যোগ করুন। এটি আপনার নতুন ট্র্যাকিং এপিআইকে মূল স্টোরের সাথে কানেক্ট করে দেবে।
import "./api/orderTrackingApiSlice";
import "./api/returnApiSlice";

import authReducer from "./features/auth/authSlice";
import favoritesReducer from "../redux/features/favorite/favoriteSlice";
import { getFavoritesFromLocalStorage } from "../Utils/localStorage";
import cartSliceReducer from "../redux/features/cart/cartSlice";
import shopReducer from "../redux/features/shop/shopSlice";

const initialFavorites = getFavoritesFromLocalStorage() || [];

const store = configureStore({
  reducer: {
    // এখানে orderTrackingApiSlice যোগ করবেন না, এটি apiSlice এর ভিতরেই কাজ করবে
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    favorites: favoritesReducer,
    cart: cartSliceReducer,
    shop: shopReducer,
  },

  preloadedState: {
    favorites: initialFavorites,
  },
  middleware: (getDefaultMiddleware) =>
    // এখানেও কিছু যোগ করবেন না
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

setupListeners(store.dispatch);

export default store;
