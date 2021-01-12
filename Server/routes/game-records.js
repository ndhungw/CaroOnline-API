const express = require("express");
const router = express.Router();
const GameController = require("../controllers/game-controller");

router.get("/", GameController.getAllGameRecords);

module.exports = router;
