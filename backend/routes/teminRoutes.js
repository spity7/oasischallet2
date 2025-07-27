// routes/terminRoutes.js
const express = require("express");
const {
  addTermin,
  getTermins,
  updateTermin,
  deleteTermin,
} = require("../controllers/terminController");
const protectRoute = require("../middlewares/protectRoute");
const authorizeRole = require("../middlewares/authorizeRole");

const router = express.Router();

// Public routes (if any)
// router.get("/public", publicTerminHandler); // example

// Protected routes (authentication middleware added)
router.post("/add-termin", protectRoute, addTermin);
router.get("/get-termins", protectRoute, getTermins);
router.put("/update-termin/:id", protectRoute, updateTermin);
router.delete("/delete-termin/:id", protectRoute, deleteTermin);

module.exports = router;
