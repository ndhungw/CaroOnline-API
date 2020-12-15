const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const Game = require("../models/game-model");

router.get("/create", authenticate, (req, res) => {
  const game = new Game();
  
})