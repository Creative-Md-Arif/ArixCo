import express from "express";
import formidable from "express-formidable";
const router = express.Router();

// controllers
import {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  fetchNewArrivals,
  fetchBestSellers,
  updateProductSalesCount,
  filterProducts,
  fetchRelatedProducts,
} from "../controllers/productController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import checkId from "../middlewares/checkId.js";

router
  .route("/")
  .get(fetchProducts)
  .post(authenticate, authorizeAdmin, formidable(), addProduct);

  router.route("/allproducts").get(fetchAllProducts);
  router.route("/:id/reviews").post(authenticate, checkId, addProductReview);
  router.get("/related/:id", fetchRelatedProducts);

  router.get("/top", fetchTopProducts);
  router.get("/new", fetchNewProducts);

  // 🆕 New routes for New Arrivals, Best Sellers, Flash Sale
router.get("/new-arrivals", fetchNewArrivals);
router.get("/best-sellers", fetchBestSellers);
router.post("/update-sales", authenticate, authorizeAdmin, updateProductSalesCount);

router
  .route("/:id")
  .get(fetchProductById)
  .put(authenticate, authorizeAdmin, formidable(), updateProductDetails)
  .delete(authenticate, authorizeAdmin, removeProduct);


  router.route("/filtered-products").post(filterProducts);


export default router;
