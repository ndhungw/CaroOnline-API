const games = require("../models/game-model");
const roomService = require('../services/roomService');
const { ROOM_SERVICE_ERROR } = require("../constants/constants");
const e = require("express");
const ServiceGame = require("../services/serviceGame");
const Game = require("../models/game-model");

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

}

GameController.find = async (req, res) => {
  const game = await games.findById(req.params.id);
  res.json(game);
}

module.exports = GameController;