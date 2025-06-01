const express = require("express");
const router = express.Router();

const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// 🔒 Correct: only admin can create, update, delete
router.get("/", verifyToken, getDepartments);
router.post("/", verifyToken, isAdmin, createDepartment);
router.put("/:id", verifyToken, isAdmin, updateDepartment);
router.delete("/:id", verifyToken, isAdmin, deleteDepartment);

module.exports = router;
