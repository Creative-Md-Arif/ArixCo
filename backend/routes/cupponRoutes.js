import express from "express";
import {
  createCuppon,
  getAllCuppons,
  getCupponById,
  updateCuppon,
  deleteCuppon,
  toggleCupponStatus,
  validateCuppon,
  getActiveCuppons,
  getCupponUsageStats,
} from "../controllers/cupponController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ============================================
//  PUBLIC / USER ROUTES
// ============================================

// @desc    Get all currently active coupons
// @route   GET /api/cuppons/active
// @access  Public
router.get("/active", getActiveCuppons);

// @desc    Validate a coupon code
// @route   POST /api/cuppons/validate
// @access  Private (logged-in user)
router.post("/validate", authenticate, validateCuppon);

// ============================================
//  ADMIN ROUTES
// ============================================

// @desc    Create a new coupon
// @route   POST /api/cuppons
// @access  Admin
router.post("/", authenticate, authorizeAdmin, createCuppon);

// @desc    Get all coupons (with pagination & filters)
// @route   GET /api/cuppons
// @access  Admin
router.get("/", authenticate, authorizeAdmin, getAllCuppons);

// @desc    Get coupon by ID
// @route   GET /api/cuppons/:id
// @access  Admin
router.get("/:id", authenticate, authorizeAdmin, getCupponById);

// @desc    Update coupon
// @route   PUT /api/cuppons/:id
// @access  Admin
router.put("/:id", authenticate, authorizeAdmin, updateCuppon);

// @desc    Delete coupon
// @route   DELETE /api/cuppons/:id
// @access  Admin
router.delete("/:id", authenticate, authorizeAdmin, deleteCuppon);

// @desc    Toggle coupon active/inactive
// @route   PATCH /api/cuppons/:id/toggle
// @access  Admin
router.patch("/:id/toggle", authenticate, authorizeAdmin, toggleCupponStatus);

// @desc    Get coupon usage statistics
// @route   GET /api/cuppons/:id/stats
// @access  Admin
router.get("/:id/stats", authenticate, authorizeAdmin, getCupponUsageStats);

export default router;
