const Game = require("../models/game-model");
const roomService = require("../services/roomService");
const { ROOM_SERVICE_ERROR } = require("../constants/constants");
const ServiceGame = require("../services/serviceGame");
const Room = require("../models/room-model");
const User = require("../models/user-model");
const Chat = require("../models/chat-model");
const GameController = {};

GameController.create = async (req, res) => {
  try {
    const game = await ServiceGame.createNewGame({
      roomId: req.body.roomId,
      maxCol: req.body.maxCol,
      maxRow: req.body.maxRow,
      winCondition: req.body.winCondition,
    });

    res.status(200).json(game);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

GameController.find = async (req, res) => {
  const game = await Game.findById(req.params.id);
  res.json(game);
};

/**
 * @route GET /game-records/
 * @description response all games' history with
 * {RoomID, Player 1, Player 2, Winner, createdAt, chatHistory}
 * @access Public
 */
GameController.getAllGameRecords = async (req, res) => {
  const getUserById = (users, id) => {
    return users.filter((user) => user._id.toString() === id.toString())[0];
  };
  const getUserByUsername = (users, username) => {
    return users.filter((user) => user.username === username)[0];
  };

  let games = [];
  const { username } = req.query;
  const users = await User.find({}); // get all users

  if (username) {
    // get this user info
    const user = getUserByUsername(users, username);

    // all game of this user, ordered desc by createdAt
    games = await Game.find({
      $or: [{ player1: user._id }, { player2: user._id }],
    }).sort({ createdAt: -1 });
  } else {
    // get all games
    games = await Game.find({}).sort({ createdAt: -1 });
  }

  const gameRecords = games.map((game, index) => {
    const player1 = getUserById(users, game.player1);
    const player2 = getUserById(users, game.player2);

    return {
      gameId: game._id,
      roomId: game.roomId,
      player1: player1,
      player2: player2,
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

  res.status(200).json({
    message: `${
      username
        ? `Get all game records of ${username} successfully`
        : "Get all game records successfully"
    }`,
    gameRecords,
  });
};

GameController.getGameRecord = async (req, res) => {
  const { id } = req.params;

  console.log(id);
  const game = await Game.findById(id);

  if (game) {
    await game.populate("player1").populate("player2").execPopulate();

    const chat = await Chat.findOne({ roomId: game.roomId });

    res.status(200).json({ game: game, chat: chat });
  } else {
    res.status(500).json({ message: "can't find game record with this id" });
  }
};
module.exports = GameController;
