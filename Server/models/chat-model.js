const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },

  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },

  messages: [{
    type: Object,
  }]


});

const Chat = mongoose.model("chats", ChatSchema);

Chat.createNew = async (roomId, gameId) => {
  const chat = new Chat();
  chat.roomId = roomId;
  chat.gameId = gameId;
  await chat.save();

  return chat;
}

module.exports = Chat;

