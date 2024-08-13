const mongoose = require("mongoose");
const Message = mongoose.model("Message");

const addMessage = async (req, res) => {
  const { id } = req.user;

  const newMessage = new Message({
    chatId: req.body.chatId,
    sender: id,
    senderModel: req.user.role,
    text: req.body.content,
  });

  const savedMessage = await newMessage.save();
  res.status(200).json(savedMessage);
};

const getMessages = async (req, res) => {
  const messages = await Message.find({
    chatId: req.params.chatId,
  }).populate({
    path: "chatId",
    populate: { path: "talent organization" },
  });
  res.status(200).json(messages);
};

module.exports = { addMessage, getMessages };
