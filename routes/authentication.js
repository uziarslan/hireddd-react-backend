const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { protect } = require("../middlewares/authMiddleware");
const {
  registerTalent,
  orgSignup,
  handleLogin,
  forgotPassword,
  verifyCode,
  setNewPassword,
  getUser,
} = require("../controllers/auth");

const router = express();

// Talent Signup Route
router.post("/signup", wrapAsync(registerTalent));

// Organization Signup Route
router.post("/org/signup", wrapAsync(orgSignup));

// Talent and Org Login Route
router.post("/login", wrapAsync(handleLogin));

// Forgot Password Logic
router.post("/forgot/password", wrapAsync(forgotPassword));

router.post("/verify/code", wrapAsync(verifyCode));

router.post("/newpassword", wrapAsync(setNewPassword));

// Talent Google Login
router.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.DOMAIN_FRONTEND}/login`,
  }),
  (req, res) => {
    res.redirect(`${process.env.DOMAIN_FRONTEND}/profile`);
  }
);

// Fetching the Talent and Org logged in user
router.get("/user", protect, wrapAsync(getUser));

module.exports = router;
