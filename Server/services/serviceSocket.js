const Game = require("../models/game-model");
const Room = require("../models/room-model");
const { getRoomInfo } = require("./roomService");
const ServiceGame = require("./serviceGame");

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("a new client");

    socket.on("new-game", async({gameId}) => {
      const game = await Game.findById(gameId);

      socket.to(game.roomId.toString()).emit("update-new-game", game);


    })

    socket.on("make-move", async ({ gameId, player, position }) => {
      const game = await Game.findById(gameId);

      await ServiceGame.makeMove(game, position);
      const result = await ServiceGame.calculateWinner(game, position);
      if (result) {
        console.log("emit winner-found");


        result.highlight.map(e => {
          game.winHighlight.push(e);
        });
        game.winner = player;
        await game.save();

        io.emit("winner-found", game);
      }
      else {
        console.log("emit update-board");
        game.playerMoveNext = 3 - game.playerMoveNext;
        await game.save();

        io.in(game.roomId.toString()).emit("update-board", game);
      }
    });

    //Subcribe to rooms representing pages the user is in
    socket.on('page-status', (page) => {
      socket.join(page);
    });

    socket.on('join-room', async({roomId}) => {
      console.log("on join-room");
      socket.join(roomId.toString());
      
      const room = await getRoomInfo({room_id: roomId});
      io.in(roomId.toString()).emit("update-room", room);
    })

    socket.on("disconnect", () => console.log("client disconnect"));
  })
};
