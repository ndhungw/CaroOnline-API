const express = require("express");
const GameController = require("../controllers/game-controller");
const router = express.Router();
const RecordsController = require("../controllers/game-records");
const authenticate = require("../middlewares/authenticate");

router.get("/", GameController.getAllGameRecords);

router.get("/personal", authenticate, RecordsController.getPersonalRecords)


router.get('/:id', RecordsController.getGameRecord);


module.exports = router;
