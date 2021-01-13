const Game = require("../models/game-model");
const roomService = require("../services/roomService");
const { ROOM_SERVICE_ERROR } = require("../constants/constants");
const ServiceGame = require("../services/serviceGame");
const Room = require("../models/room-model");
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
  // get all games
  const games = await Game.find({}).sort({ createdAt: -1 });
  // get all rooms
  const rooms = await Room.find({});
  const getRoomById = (roomId) => {
    const arrFound = rooms.filter(
      (room) => room._id.toString() === roomId.toString()
    );

    return arrFound[0];
  };

  // from rooms, get info of 2 player;
  const gameRecords = games.map((game, index) => {
    const room = getRoomById(game.roomId);

    return {
      roomId: room._id,
      player1: room.Player1,
      player2: room.Player2,
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
    gameRecords,
  });
};

GameController.getGameRecord = async (req, res) => {
  const { id } = req.params;

  console.log(id);
  const game = await Game.findById(id);

  if (game) {
    await game.populate("player1").populate("player2").execPopulate();

    const chat = await Chat.findOne({roomId: game.roomId});

    res.status(200).json({game:game, chat:chat});
  }
  else {
    res.status(500).json({message: "can't find game record with this id"});
  }


}
module.exports = GameController;
