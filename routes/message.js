const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { addMessage, getMessages } = require("../controllers/messaging");
const { protect } = require("../middlewares/authMiddleware");

// Add message
router.post("/message", protect, wrapAsync(addMessage));

// Get messages
router.get("/messages/:chatId", protect, wrapAsync(getMessages));

module.exports = router;
