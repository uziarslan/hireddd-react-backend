const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const {
  fetchAllTalents,
  fetchDynamicFilters,
  fetchFilteredTalents,
  getTalentProfile,
} = require("../controllers/search");
const { protect } = require("../middlewares/authMiddleware");

const router = express();

// Get all the talents with profile completed
router.get("/get/talent", protect, wrapAsync(fetchAllTalents));

// Get all the location filters form the talent's location
router.get("/dynamic/filters", protect, wrapAsync(fetchDynamicFilters));

// Get the filtered results from the database
router.post("/get/talent/filter", protect, wrapAsync(fetchFilteredTalents));

// Get the individual Talent using ID
router.get("/profile/:talentId", protect, wrapAsync(getTalentProfile));

module.exports = router;
