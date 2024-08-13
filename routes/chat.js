const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { protect } = require("../middlewares/authMiddleware");
const { createChat, getChats } = require("../controllers/chatting");

// Create new chat
router.post("/chat", protect, wrapAsync(createChat));

// Get chats for a talent or organization
router.get("/chats/:userId", protect, wrapAsync(getChats));

module.exports = router;
