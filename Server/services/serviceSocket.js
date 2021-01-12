const Game = require("../models/game-model");
const Room = require("../models/room-model");
const { getRoomInfo, updateRoomInfo, deleteExistingRoom, getAllRooms } = require("./roomService");
const ServiceGame = require("./serviceGame");

const timePerTurn = 30;

module.exports = function (io) {
  io.on("connection", (socket) => {
    allClients = [...allClients, socket];
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

    socket.on('join-room', async({roomId, playerId, playerNumber}) => {
      console.log("on join-room");
      socket.join(roomId.toString());
      
      const room = await getRoomInfo({room_id: roomId, IsDeleted: false});
      if(playerNumber && room){
        const resultingPlayer = playerInRoom.find(entry => entry.roomId === room._id.toString() && entry.playerId === playerId.toString());
        if(!resultingPlayer){
          playerInRoom = [...playerInRoom, {roomId: room._id.toString(), playerId: playerId.toString(), playerNumber, socket}];
        }else { 
          resultingPlayer.socket = socket;
          socket.broadcast.to(roomId.toString()).emit('disconnect-other-tabs', {player: playerNumber, roomId: room._id.toString()});
        }
      }

      console.log(playerInRoom);

      io.in(roomId.toString()).emit("update-room", room);
      
    });

    socket.on('leave-room', async({roomId, playerNumber, player, deleteRoom}) => {
      console.log('someone left the room: ', roomId.toString());
      socket.leave(roomId.toString());

      try{
        if((playerNumber === 1 || playerNumber === 2) && roomId && player){
          const resultingPlayer = playerInRoom.find(entry => entry.roomId === roomId.toString() && entry.playerId === player._id.toString());
          if(resultingPlayer){
            const foundIdx = playerInRoom.indexOf(resultingPlayer);
            playerInRoom.splice(foundIdx, 1);
          }
          let room; 
          if(!deleteRoom){
            room = playerNumber === 2 ? 
            await updateRoomInfo({room_id: roomId.toString(), updatedBy: player, Player2: null})
            : await updateRoomInfo({room_id: roomId.toString(), updatedBy: player, Player1: null});
            io.emit('one-room-got-updated', await getAllRooms({}));
          }else {
            await updateRoomInfo({room_id: roomId.toString(), updatedBy: player, Player1: null, Player2: null, IsDeleted: deleteRoom});
            room = await deleteExistingRoom({room_id: roomId.toString(), updatedBy: player});
            io.emit('one-room-got-deleted', await getAllRooms({}));
          };
          io.in(roomId.toString()).emit('update-room', room);
        }  
      } catch (e) {
        console.log(e);
        io.emit('room-processing-error', e);
      }
    });

    socket.on("disconnect", (reason) => {
      const i = allClients.indexOf(socket);
      const item = allClients.splice(i, 1);
      
      const resultingPlayer = playerInRoom.find(entry => entry.socket.id === item.id);
      if(resultingPlayer) {
        const foundIdx = playerInRoom.indexOf(resultingPlayer);
        playerInRoom.splice(foundIdx, 1);
      }  
      socket.emit('disconnected');
      
      console.log("client disconnect");
    });
  })
};
