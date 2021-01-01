const games = require("../models/game-model")

const GameController = {};

GameController.create = async (req, res) => {
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

GameController.find = async (req, res) => {
  const game = await games.findById(req.params.id);
  res.json(game);
}

GameController.join = async (req, res) => {
  const game = await games.findById(req.params.id);
  if (!game.player2) {
    game.player2 = req.user._id,
    res.status(200).json({game: game, message: "Game joined successfully"});
  }
  else {
    if (game.player2 !== req.user._id) {
      return res.status(200).json({game: null, message: "Game already fulled"});
    }
    else {
      return res.status(200).json({game: game, message: "Game rejoined"});
    }
    
  }
}
module.exports = GameController;