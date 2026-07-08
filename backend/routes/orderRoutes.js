import express from "express";
const router = express.Router();

import {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  getSalesSummaryByStatus,
  getDeliverySummary,
  calcualteTotalSalesByDate,
  findOrderById,
  markOrderAsPaid,

  countTotalOrdersByDate,
  updateOrderStatus,
} from "../controllers/orderController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

router
  .route("/")
  .post(authenticate, createOrder)
  .get(authenticate, authorizeAdmin, getAllOrders);

router.route("/mine").get(authenticate, getUserOrders);
router
  .route("/total-orders")
  .get(authenticate, authorizeAdmin, countTotalOrders);
router
  .route("/total-orders-by-date")
  .get(authenticate, authorizeAdmin, countTotalOrdersByDate);
router
  .route("/total-sales")
  .get(authenticate, authorizeAdmin, calculateTotalSales);
router
  .route("/sales-summary")
  .get(authenticate, authorizeAdmin, getSalesSummaryByStatus);
router
    .route("/delivery-summary")
    .get(authenticate, authorizeAdmin, getDeliverySummary);
router
  .route("/total-sales-by-date")
  .get(authenticate, authorizeAdmin, calcualteTotalSalesByDate);
router.route("/:id").get(authenticate, findOrderById);
router.route("/:id/pay").put(authenticate, markOrderAsPaid);


  router
  .route("/:id/status")
  .put(authenticate, authorizeAdmin, updateOrderStatus);

export default router;
