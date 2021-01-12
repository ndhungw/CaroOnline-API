const Chat = require("../models/chat-model");
const Game = require("../models/game-model");
const Room = require("../models/room-model");
const User = require("../models/user-model");
const {
  getRoomInfo,
  updateRoomInfo,
  deleteExistingRoom,
  getAllRooms,
} = require("./roomService");
const ServiceGame = require("./serviceGame");

const timePerTurn = 30;

const allClients = [];

let playerInRoom = [];

const allUserIds = {};

const allUsersOnline = {};

module.exports = function (io) {
  io.on("connection", (socket) => {
    allClients.push(socket);
    console.log("a new client");

    //SUPPORTING FUNCTION
    const declareWinner = async (game, message) => {
      console.log(game);
      const result = await ServiceGame.calculateGameScore(game);
      console.log(result);
      io.in(game.roomId.toString()).emit(message, game);
      const room = await getRoomInfo({ room_id: game.roomId });
      io.in(room._id.toString()).emit("update-room", room);
    };

    const handleLogin = async (socket, userId) => {
      allUserIds[socket.id.toString()] = userId;
      const user = await User.findById(userId);

      const savedInfo = {
        profileImage: user.profileImage,
        username: user.username,
      };
      allUsersOnline[userId.toString()] = savedInfo;

      console.log(allUsersOnline);

      io.emit("update-online-list", allUsersOnline);
    };

    const handleLogout = (socket) => {
      if (socket) {
        const userId = allUserIds[socket.id.toString()];

        if (userId) {
          delete allUsersOnline[userId.toString()];
          io.emit("update-online-list", allUsersOnline);
        }
      }
    };

    let countdown = timePerTurn;

    let timer;

    const setCountdown = (seconds) => {
      countdown = seconds;
    };

    const startCountdown = (roomId, gameId) => {
      timer = setInterval(async function () {
        countdown--;
        io.in(roomId.toString()).emit("countdown", countdown);

        if (countdown === 0) {
          const newGame = await Game.findById(gameId);

          newGame.winner = 3 - newGame.playerMoveNext;
          await newGame.save();
          await declareWinner(newGame, "timeout");
          clearInterval(timer);
        }
      }, 1000);
    };

    const resetCountdown = () => {
      countdown = timePerTurn;
    };

    const stopCountdown = () => {
      clearInterval(timer);
    };

    socket.on("new-game", async ({ gameId }) => {
      const game = await Game.findById(gameId);

      socket.to(game.roomId.toString()).emit("update-new-game", game);

      stopCountdown();
      setCountdown(timePerTurn);
      startCountdown(game.roomId, game._id);
    });

    socket.on("make-move", async ({ gameId, player, position }) => {
      const game = await Game.findById(gameId);

      await ServiceGame.makeMove(game, position);
      resetCountdown();
      const result = await ServiceGame.calculateWinner(game, position);
      if (result) {
        console.log("emit winner-found");

        result.highlight.map((e) => {
          game.winHighlight.push(e);
        });
        game.winner = player;
        await game.save();

        await declareWinner(game, "winner-found");
        stopCountdown();
      } else {
        console.log("emit update-board");
        game.playerMoveNext = 3 - game.playerMoveNext;
        await game.save();

        io.in(game.roomId.toString()).emit("update-board", game);
      }
    });

    //Subcribe to rooms representing pages the user is in
    socket.on("page-status", (page) => {
      socket.join(page);
    });

    socket.on("join-room", async ({ roomId, playerId, playerNumber }) => {
      console.log("on join-room");
      socket.join(roomId.toString());

      const room = await getRoomInfo({ room_id: roomId, IsDeleted: false });
      if (playerNumber && room) {
        const resultingPlayer = playerInRoom.find(
          (entry) =>
            entry.roomId === room._id.toString() &&
            entry.playerId === playerId.toString()
        );
        if (!resultingPlayer) {
          playerInRoom = [
            ...playerInRoom,
            { roomId: room._id.toString(), playerId, playerNumber, socket },
          ];
        } else {
          if (resultingPlayer.connectionToRoomState === false) {
            resultingPlayer.connectionToRoomState = true;
            resultingPlayer.socket = socket;
          }
          //io.in(roomId.toString()).emit('disconnect-other-tabs', {player: playerNumber});
        }
      }

      io.in(roomId.toString()).emit("update-room", room);
    });

    socket.on("send-chat-message", async ({ roomId, message, username }) => {
      let chat = await Chat.findOne({ roomId: roomId });

      if (!chat) {
        chat = await Chat.createNew(roomId);
      }

      chat.messages.push({
        username: username,
        message: message,
      });

      await chat.save();

      io.in(roomId.toString()).emit("update-chat", chat);
    });

    socket.on(
      "leave-room",
      async ({ roomId, playerNumber, player, deleteRoom }) => {
        console.log("someone left the room: ", roomId.toString());
        socket.leave(roomId.toString());

        try {
          if ((playerNumber === 1 || playerNumber === 2) && roomId && player) {
            const resultingPlayer = playerInRoom.find(
              (entry) =>
                entry.roomId === roomId.toString() &&
                entry.playerId === player._id.toString()
            );
            if (resultingPlayer) {
              const foundIdx = playerInRoom.indexOf(resultingPlayer);
              playerInRoom.splice(foundIdx, 1);
            }
            let room;
            if (!deleteRoom) {
              room =
                playerNumber === 2
                  ? await updateRoomInfo({
                      room_id: roomId.toString(),
                      updatedBy: player,
                      Player2: null,
                    })
                  : await updateRoomInfo({
                      room_id: roomId.toString(),
                      updatedBy: player,
                      Player1: null,
                    });
              io.emit("one-room-got-updated", await getAllRooms({}));
            } else {
              await updateRoomInfo({
                room_id: roomId.toString(),
                updatedBy: player,
                Player1: null,
                Player2: null,
                IsDeleted: deleteRoom,
              });
              room = await deleteExistingRoom({
                room_id: roomId.toString(),
                updatedBy: player,
              });
              io.emit("one-room-got-deleted", await getAllRooms({}));
            }
            io.in(roomId.toString()).emit("update-room", room);
          }
        } catch (e) {
          console.log(e);
          io.emit("room-processing-error", e);
        }
      }
    );

    socket.on("login", async (userId) => {
      console.log("on login: " + userId);
      await handleLogin(socket, userId);
    });

    socket.on("logout", () => {
      console.log("on logout");
      handleLogout(socket);
    });

    socket.on("disconnect", async (reason) => {
      const i = allClients.indexOf(socket);
      const item = allClients.splice(i, 1);

      handleLogout(socket);

      const resultingPlayer = playerInRoom.find(
        (entry) => entry.socket.id === item.id
      );
      if (resultingPlayer) {
        const foundIdx = playerInRoom.indexOf(resultingPlayer);
        playerInRoom.splice(foundIdx, 1);
      }
      socket.emit("disconnected");

      handleLogout(socket);

      console.log("client disconnect");
    });
  });
};
