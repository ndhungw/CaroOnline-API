const games = require("../models/game-model")

const GameCotroller = {};

GameCotroller.create = async (req, res) => {
  try {
    console.log(req.body);
    const game = await games.createNewGame({
      player: req.user._id,
      maxCol: req.body.maxCol,
      maxRow: req.body.maxRow,
      winCondition: req.body.winCondition,
    });

    res.status(200).json({ game: game });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
  
}

GameCotroller.find = async (req, res) => {
  const game = await games.findById(req.params.id);
  res.json(game);
}
module.exports = GameCotroller;