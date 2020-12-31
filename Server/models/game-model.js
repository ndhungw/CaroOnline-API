const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const GameSchema = new mongoose.Schema(
  {
    player1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    player2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    winCondition: {
      type: Number,
      default: 3,
      required: true,
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

Game.createNewGame = async ({player, maxCol, maxRow, winCondition}) => {
  const length = maxRow * maxCol;
  console.log(maxCol, maxRow);
  const board = Array(length).fill(0);
  const game = new Game({
    player1: player, 
    maxRow: maxRow,
    maxCol: maxCol,
    winCondition: winCondition,
    board: board});

    await game.save();
    return game;
}

module.exports = Game;