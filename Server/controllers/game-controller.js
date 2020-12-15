const Game = require("../models/game-model")

const GameCotroller = {
  Create: async function(req, res) {
    try {
      const game = await Game.createNewGame({
        player: req.user._id,
        maxRow: req.body.maxRow,
        maxCol: req.body.maxCol,
        winCondition: req.body.winCondition,
      });

      res.status(200).json({ game: game });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
    


  }
}

module.exports = GameCotroller;