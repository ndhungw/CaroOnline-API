const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const GameSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },

    playerMoveNext: {
      type: Number,
      required: true,
    },

    player1: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'Users',
    },

    player2: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'Users',
    },

    winCondition: {
      type: Number,
      default: 3,
      required: true,
    },

    winHighlight: [{ type: Number }],

    winner: {
      type: Number,
      default: 0,
    },

    maxRow: {
      type: Number,
      required: true,
    },

    maxCol: {
      type: Number,
      required: true,
    },

    board: {
      type: Array,
      required: true,
    },

    history: [
      {
        type: Object,
      },
    ],
  },
  { timestamps: true }
);

const Game = mongoose.model("games", GameSchema);

Game.createNewGame = async ({
  room,
  maxCol,
  maxRow,
  firstTurn,
  winCondition,
}) => {
  const length = maxRow * maxCol;
  const board = Array(length).fill(0);
  const game = new Game({
    roomId: room._id,
    playerMoveNext: firstTurn,
    player1: room.Player1,
    player2: room.Player2,
    maxRow: maxRow,
    maxCol: maxCol,
    winCondition: winCondition,
    history: [],
    board: board,
  });

  await game.save();
  return game;
};

module.exports = Game;
