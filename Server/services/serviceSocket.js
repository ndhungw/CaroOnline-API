const Chat = require("../models/chat-model");
const Game = require("../models/game-model");
const Room = require("../models/room-model");
const { getRoomInfo } = require("./roomService");
const ServiceGame = require("./serviceGame");

const timePerTurn = 30;

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("a new client");

    //SUPPORTING FUNCTION
    const declareWinner = async (game, message) => {
      console.log(game);
      const result = await ServiceGame.calculateGameScore(game);
      console.log(result);
      io.in((game.roomId).toString()).emit(message, game);
      const room = await getRoomInfo({ room_id: game.roomId });
      io.in((room._id).toString()).emit("update-room", room);
    }

    let countdown = timePerTurn;

    let timer;

    const setCountdown = (seconds) => {
      countdown = seconds;
    }

    const startCountdown = (roomId, gameId) => {

      timer = setInterval(async function () {
        countdown--;
        io.in((roomId).toString()).emit('countdown', countdown);

        if (countdown === 0) {
          const newGame = await Game.findById(gameId);

          newGame.winner = 3 - newGame.playerMoveNext;
          await newGame.save();
          await declareWinner(newGame, 'timeout');
          clearInterval(timer);
        }
      }, 1000);
    }

    const resetCountdown = () => {
      countdown = timePerTurn;

    }

    const stopCountdown = () => {
      clearInterval(timer);
    }



    socket.on("new-game", async ({ gameId }) => {
      const game = await Game.findById(gameId);

      socket.to(game.roomId.toString()).emit("update-new-game", game);

      stopCountdown();
      setCountdown(timePerTurn);
      startCountdown(game.roomId, game._id);
    })

    socket.on("make-move", async ({ gameId, player, position }) => {
      const game = await Game.findById(gameId);

      await ServiceGame.makeMove(game, position);
      resetCountdown();
      const result = await ServiceGame.calculateWinner(game, position);
      if (result) {
        console.log("emit winner-found");

        
        result.highlight.map(e => {
          game.winHighlight.push(e);
        });
        game.winner = player;
        await game.save();

        await declareWinner(game, "winner-found")
        stopCountdown();

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

    socket.on('join-room', async ({ roomId }) => {
      console.log("on join-room");
      socket.join(roomId.toString());

      const room = await getRoomInfo({ room_id: roomId });
      io.in(roomId.toString()).emit("update-room", room);
    })

    socket.on("send-chat-message", async({roomId, message, username}) => {
      let chat = await Chat.findOne({roomId: roomId});

      if (!chat) {
        chat = await Chat.createNew(roomId);
      }

      chat.messages.push({
        username: username,
        message: message,
      })

      await chat.save();

      io.in(roomId.toString()).emit("update-chat", chat);
    })

    socket.on("disconnect", () => {
      
      console.log("client disconnect");
    });


  })
};
