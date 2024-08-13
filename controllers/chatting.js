const mongoose = require("mongoose");
const Chat = mongoose.model("Chat");
const Message = mongoose.model("Message");

const createChat = async (req, res) => {
  const newChat = new Chat({
    talent: req.body.talentId,
    organization: req.body.organizationId,
  });
  const message = new Message({
    chatId: newChat._id,
    sender: req.body.organizationId,
    senderModel: req.user.role,
  });
  await message.save();
  const savedChat = await newChat.save();
  res.status(200).json(savedChat);
};

const getChats = async (req, res) => {
  const { userId } = req.params;
  const { userType } = req.query;
  let chats;
  if (userType === "talent") {
    chats = await Chat.find({ talent: userId }).populate("organization");
  } else if (userType === "organization") {
    chats = await Chat.find({ organization: userId }).populate("talent");
  } else {
    return res.status(400).json({ message: "Invalid user type" });
  }
  res.status(200).json(chats);
};

module.exports = {
  createChat,
  getChats,
};
