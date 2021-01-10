const games = require("../models/game-model");
const roomService = require('../services/roomService');
const { ROOM_SERVICE_ERROR } = require("../constants/constants");
const e = require("express");
const ServiceGame = require("../services/serviceGame");

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

GameController.join = async (req, res) => {
  try {
    const wantedroomId = await games.find({ roomId: req.params.roomId });
    const wantedRoom = await roomService.getRoomInfo({ room_id: roomId });

    let playeNumber = null;

    //find out user is which player in the room
    if (req.user === wantedRoom.Player1) {
      playeNumber = 1;
    }
    else if (req.user === wantedRoom.Player2) {
      playeNumber = 2;
    } else {
      const error = new Error();
      error.name = ROOM_SERVICE_ERROR;
      error.message = "This room is full";

    }
    const currentGame = wantedRoom.CurrentGame;
    res.status(200).json({currentGame: currentGame});
  } catch (e) {
    res.status(500).json({message: e.message});
  }
}
module.exports = GameController;