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
  fetchTopProducts,
  fetchNewProducts,
  fetchNewArrivals,
  fetchBestSellers,
  updateProductSalesCount,
  filterProducts,
  fetchRelatedProducts,
  toggleFeatured,
} from "../controllers/productController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import checkId from "../middlewares/checkId.js";
import { attachCampaignPricing } from "../middlewares/attachCampaignPricing.js";




router
  .route("/")
  .get(attachCampaignPricing, fetchProducts)
  .post(authenticate, authorizeAdmin, formidable(), addProduct);

router.route("/allproducts").get(attachCampaignPricing, fetchAllProducts);

router.get("/related/:id", attachCampaignPricing, fetchRelatedProducts);
router.get("/top", attachCampaignPricing, fetchTopProducts);
router.get("/new", attachCampaignPricing, fetchNewProducts);

// 🆕 New routes for New Arrivals, Best Sellers, Flash Sale
router.get("/new-arrivals", attachCampaignPricing, fetchNewArrivals);
router.get("/best-sellers", attachCampaignPricing, fetchBestSellers);

router.post(
  "/update-sales",
  authenticate,
  authorizeAdmin,
  updateProductSalesCount,
);

router
  .route("/:id")
  .get(attachCampaignPricing, fetchProductById)
  .put(authenticate, authorizeAdmin, formidable(), updateProductDetails)
  .delete(authenticate, authorizeAdmin, removeProduct);

router.route("/filtered-products").post(attachCampaignPricing, filterProducts);
router
  .route("/:id/toggle-featured")
  .put(authenticate, authorizeAdmin, toggleFeatured);
export default router;
