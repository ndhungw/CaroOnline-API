const io = require("socket.io");
const Game = require("../models/game-model");
const ServiceGame = require("./serviceGame");

const serviceSocket = {};

serviceSocket.HandleConnection = (socket) => {
    console.log("a new client");

    socket.on("make-move", async ({gameId, player, position}) => {
      await ServiceGame.makeMove(gameId, player, position);
      const result = await ServiceGame.calculateWinner(gameId, position);
      if (result) {
        console.log(result);
        console.log("emit winner-found");
        socket.emit("winner-found", result);
      }
      else {
        console.log("emit update-board");
        const game = await Game.findById(gameId);
        socket.emit("update-board", game);
      }
    });

    //Subcribe to rooms representing pages the user is in
    socket.on('page-status', (page)=>{
        socket.join(page);
    });

    socket.on("disconnect", () => console.log("client disconnect"));
}
module.exports = serviceSocket;
