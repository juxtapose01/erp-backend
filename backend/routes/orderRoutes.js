const express = require("express");
const router = express.Router();
const {
  getOrders,
  createOrder,
  getOrderStats,
} = require("../controllers/orderController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.post("/", verifyToken, isAdmin, createOrder);
router.get("/", verifyToken, getOrders);

router.get("/stats", verifyToken, getOrderStats);

module.exports = router;
