const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["talent", "organization"],
    },
    text: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
