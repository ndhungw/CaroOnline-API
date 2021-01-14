const Game = require("../models/game-model");
const Room = require("../models/room-model");
const User = require("../models/user-model");
const Chat = require("../models/chat-model");

const RecordsController = {};

RecordsController.getGameRecord = async (req, res, next) => {
  const { id } = req.params;

  console.log(id);
  const game = await Game.findById(id);

  if (game) {
    await game.populate("player1").populate("player2").execPopulate();

    const chat = await Chat.findOne({ roomId: game.roomId});

    res.status(200).json({ game: game, chat: chat });
  } else {
    res.status(500).json({ message: "can't find game record with this id" });
  }
};

RecordsController.getPersonalRecords = async (req, res) => {
  console.log(req.user);

  let games = [];

  const user = req.user;

  // all game of this user, ordered desc by createdAt
  games = await Game.find({
    $or: [{ player1: user._id }, { player2: user._id }],
  }).sort({ createdAt: -1 }).populate('player1').populate('player2');

  const gameRecords = games.map((game, index) => {

    return {
      gameId: game._id,
      roomId: game.roomId,
      player1: game.player1,
      player2: game.player2,
      winner: game.winner,
      createdAt: game.createdAt,
      history: game.history,
      winCondition: game.winCondition,
      winHighlight: game.winHighlight,
      maxRow: game.maxRow,
      maxCol: game.maxCol,
      board: game.board,
    };
  });

  console.log(gameRecords);

  res.status(200).json({gameRecords});
}

module.exports = RecordsController;