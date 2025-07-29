const express = require("express");
const {
  signupUser,
  loginUser,
  logoutUser,
  getRoles,
  getAllEmployees,
  verifyEmail,
  exportAllEmployeesToCSV,
  exportFilteredEmployeesToCSV,
  updateEmployee,
  deleteEmployee,
  getUserById,
  updateProfile,
} = require("../controllers/userController");
const protectRoute = require("../middlewares/protectRoute.js");
const authorizeRole = require("../middlewares/authorizeRole.js");

const router = express.Router();

// Public Routes
router.post("/signup", signupUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/roles", protectRoute, authorizeRole("Admin"), getRoles);

// Protected Routes

// Only Admin Routes
router.get(
  "/get-all-employees",
  protectRoute,
  authorizeRole("Admin"),
  getAllEmployees
);
router.get(
  "/export-all-employees-to-csv",
  protectRoute,
  authorizeRole("Admin"),
  exportAllEmployeesToCSV
);
router.get(
  "/export-filtered-employees-to-csv",
  protectRoute,
  authorizeRole("Admin"),
  exportFilteredEmployeesToCSV
);
router.put(
  "/update-employee/:id",
  protectRoute,
  authorizeRole("Admin"),
  updateEmployee
);
router.delete(
  "/delete-employee/:id",
  protectRoute,
  authorizeRole("Admin"),
  deleteEmployee
);

// Other Routes
router.get("/user/:id", protectRoute, authorizeRole("Admin"), getUserById);
router.put("/user/:id", protectRoute, authorizeRole("Admin"), updateProfile);

module.exports = router;
