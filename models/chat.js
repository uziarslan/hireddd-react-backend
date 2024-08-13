const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    talent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Talent",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
