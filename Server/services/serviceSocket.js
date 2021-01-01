const io = require("socket.io");
const ServiceGame = require("./serviceGame");

const serviceSocket = {};

serviceSocket.HandleConnection = (client) => {
  console.log("a new client");

  client.on("make-move", async ({gameId, player, position}) => {
    await ServiceGame.makeMove(gameId, player, position);
    const result = ServiceGame.calculateWinner(gameId, position);
    if (result) {
      io.emit("winner-found", result);
    }
  });
  
  client.on("disconnect", () => console.log("client disconnect"));
}

module.exports = serviceSocket;