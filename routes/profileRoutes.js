const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const { protect } = require("../middlewares/authMiddleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const {
  talentProfileHandler,
  organizationHandler,
} = require("../controllers/profile");

const router = express();

// Talent Profile Handler
router.post(
  "/talent/profile",
  protect,
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  wrapAsync(talentProfileHandler)
);

// Organization Profile Handler
router.post(
  "/org/profile",
  protect,
  upload.single("profile"),
  wrapAsync(organizationHandler)
);

module.exports = router;
