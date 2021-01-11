const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const GameSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },

    playerMoveNext: {
      type: Number,
      required: true,
    },

    winCondition: {
      type: Number,
      default: 3,
      required: true,
    },

    winHighlight: [{type: Number}],

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
    
  },
  { timestamps: true }
);

const Game = mongoose.model("games", GameSchema);

Game.createNewGame = async ({roomId, maxCol, maxRow, firstTurn, winCondition}) => {
  const length = maxRow * maxCol;
  console.log(maxCol, maxRow);
  const board = Array(length).fill(0);
  const game = new Game({
    roomId: roomId,
    playerMoveNext: firstTurn,
    maxRow: maxRow,
    maxCol: maxCol,
    winCondition: winCondition,
    board: board});

    await game.save();
    return game;
}

module.exports = Game;