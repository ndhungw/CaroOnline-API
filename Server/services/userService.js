const User = require("../models/user-model");


const UserService = {
  changeTrophies: async function(userId, number) {
    const user = User.findById(userId);
    
    user.trophies = user.trophies + number;

    await user.save();

    return user;
  },

  wonGame: async function(userId) {

    const user = await User.findById(userId);
    user.gamesWon = user.gamesWon + 1;

    await user.save();

    return user;
  },

  lostGame: async function(userId) {

    const user = await User.findById(userId);
    user.gamesLost = user.gamesWon + 1;

    await user.save();

    return user;
  }
  
};

module.exports = UserService;