const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },

  messages: [{
    type: Object,
  }]


});

const Chat = mongoose.model("chats", ChatSchema);

Chat.createNew = async (roomId) => {
  const chat = new Chat();
  chat.roomId = roomId;
  await chat.save();

  return chat;
}

module.exports = Chat;

