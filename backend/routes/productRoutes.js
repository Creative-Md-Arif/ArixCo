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
import { attachCampaignPricing } from "../middlewares/attachCampaignPricing.js"; // 🆕 নতুন import

router
  .route("/")
  .get(attachCampaignPricing, fetchProducts) // 🆕 middleware যোগ হলো
  .post(authenticate, authorizeAdmin, formidable(), addProduct);

router.route("/allproducts").get(attachCampaignPricing, fetchAllProducts); // 🆕

router.route("/:id/reviews").post(authenticate, checkId, addProductReview); // অপরিবর্তিত (price দেখায় না)

router.get("/related/:id", attachCampaignPricing, fetchRelatedProducts); // 🆕
router.get("/top", attachCampaignPricing, fetchTopProducts); // 🆕
router.get("/new", attachCampaignPricing, fetchNewProducts); // 🆕

// 🆕 New routes for New Arrivals, Best Sellers, Flash Sale
router.get("/new-arrivals", attachCampaignPricing, fetchNewArrivals); // 🆕
router.get("/best-sellers", attachCampaignPricing, fetchBestSellers); // 🆕

router.post(
  "/update-sales",
  authenticate,
  authorizeAdmin,
  updateProductSalesCount,
); // অপরিবর্তিত (write operation)

router
  .route("/:id")
  .get(attachCampaignPricing, fetchProductById) 
  .put(authenticate, authorizeAdmin, formidable(), updateProductDetails) 
  .delete(authenticate, authorizeAdmin, removeProduct); // অপরিবর্তিত

router.route("/filtered-products").post(attachCampaignPricing, filterProducts); // 🆕

export default router;
