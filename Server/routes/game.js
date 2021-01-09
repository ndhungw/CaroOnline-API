const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const Game = require("../models/game-model");
const GameController = require("../controllers/game-controller");  

router.post("/create", authenticate, GameController.create);

router.get("/:id", GameController.find);

router.put("/:roomId", authenticate, GameController.join);

module.exports = router;
