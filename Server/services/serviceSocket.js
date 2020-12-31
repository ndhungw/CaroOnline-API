const ServiceGame = require("./serviceGame");

const serviceSocket = {};

serviceSocket.HandleConnection = (client) => {
  console.log("a new client");
  client.on("make-move", async ({gameId, player, position}) => await ServiceGame.makeMove(gameId, player, position));
  client.on("disconnect", () => console.log("client disconnect"));
}

module.exports = serviceSocket;