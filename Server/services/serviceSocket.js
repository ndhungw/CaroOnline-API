const Chat = require("../models/chat-model");
const Game = require("../models/game-model");
const Room = require("../models/room-model");
const User = require("../models/user-model");
const {
  getRoomInfo,
  updateRoomInfo,
  deleteExistingRoom,
  getAllRooms,
  AddNewRoom
} = require("./roomService");
const ServiceGame = require("./serviceGame");

const timePerTurn = 30;



module.exports = function (io) {
  io.on("connection", (socket) => {
    allClients = [...allClients, socket];
    console.log("a new client");

    //SUPPORTING FUNCTION
    const declareWinner = async (game, message) => {
      stopCountdown(game.roomId);
      resetCountdown(game.roomId);
      const result = await ServiceGame.calculateGameScore(game);
      console.log(result);
      io.in(game.roomId.toString()).emit(message, game);
      const room = await getRoomInfo({ room_id: game.roomId});
      io.in(room._id.toString()).emit("update-room", room);
    };

    const handleLogin = async (socket, userId) => { 
      socket.join('ping instances of user ' + userId.toString()); 
      allUserIds[socket.id.toString()] = userId;
      const user = await User.findById(userId);

      const savedInfo = {
        profileImage: user.profileImage,
        username: user.username,
      };
      allUsersOnline[userId.toString()] = savedInfo;

      io.emit("update-online-list", allUsersOnline);

      //if user is in matchmake, we emit is matchmaking event
      const userIdx_inMatchMakeQueue = matchMakingQueue.indexOf(userId.toString());
      const userIdx_inCreateRoomQueue = createRoomQueue.indexOf(userId.toString());
      if(userIdx_inMatchMakeQueue !== -1){
        io.to('ping instances of user ' + userId.toString()).emit('is-matchmaking', {state: true});
      } else if(userIdx_inCreateRoomQueue !== -1) {
        io.to('ping instances of user ' + userId.toString()).emit('is-waiting-create-room', {state: true});
      }
    };

    const handleLogout = (socket) => {
      if (socket) {
        const userId = allUserIds[socket.id.toString()];

        if (userId) {
          delete allUsersOnline[userId.toString()];
          
          const userIdx_inQueue = matchMakingQueue.indexOf(userId);
          //Remove user from matchmaking queue if he is in queue
          if(userIdx_inQueue !== -1){
            matchMakingQueue.splice(userIdx_inQueue, 1);
            io.to('ping instances of user ' + userId.toString()).emit('is-matchmaking', {state: false});
            console.log('someone exited matchmake', matchMakingQueue);
            const checkIfUserInCreateRoomQueue = createRoomQueue.indexOf(userId);
            // Remove user from create room queue if he is in queue
            if(checkIfUserInCreateRoomQueue !== -1){
              createRoomQueue.splice(checkIfUserInCreateRoomQueue, 1);
              io.to('ping instances of user ' + userId.toString()).emit('is-waiting-create-room', {state: false});
              console.log('someone exited create room queue', createRoomQueue);
            }
          }

          io.emit("update-online-list", allUsersOnline);
        }
      }
    };

    const intervalCountdown = async (roomId, gameId) => {
      allTimers[roomId.toString()].countdown--;

      const countdown = allTimers[roomId.toString()].countdown;
      io.in(roomId.toString()).emit("countdown", countdown);

      if (countdown === 0) {
        const newGame = await Game.findById(gameId);

        newGame.winner = 3 - newGame.playerMoveNext;
        await newGame.save();
        await declareWinner(newGame, "timeout");
        console.log(countdown);
      }

      console.log(countdown);
    }

    const startCountdown = (roomId, gameId) => {
      console.log("start countdown");

      if (!allTimers[roomId.toString()]) {
        allTimers[roomId.toString()] = {};
      }
      allTimers[roomId.toString()].countdown = timePerTurn;

      allTimers[roomId.toString()].timer = setInterval(function () {
        intervalCountdown(roomId, gameId);

      }, 1000);

      console.log(allTimers[roomId.toString()]);

    };

    const resetCountdown = (roomId) => {

      if (allTimers[roomId.toString()]) {
        console.log("reset countdown");
        allTimers[roomId.toString()].countdown = timePerTurn;
      }
      
    };

    const stopCountdown = (roomId) => {
      console.log("stop countdown");
      if (allTimers[roomId.toString()]) {
        clearInterval(allTimers[roomId.toString()].timer);
      }


    };

    socket.on("new-game", async ({ gameId }) => {
      const game = await Game.findById(gameId);

      socket.to(game.roomId.toString()).emit("update-new-game", game);

      stopCountdown(game.roomId);
      resetCountdown(game.roomId);
      startCountdown(game.roomId, game._id);
    });

    socket.on("make-move", async ({ gameId, player, position }) => {
      const game = await Game.findById(gameId);
      resetCountdown(game.roomId);
      await ServiceGame.makeMove(game, position);
      const result = await ServiceGame.calculateWinner(game, position);
      if (result) {
        console.log("emit winner-found");

        result.highlight.map((e) => {
          game.winHighlight.push(e);
        });
        game.winner = player;
        await game.save();

        await declareWinner(game, "winner-found");
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

    socket.on("join-room", ({ roomId, playerId, playerNumber }) => {
      console.log("on join-room");
      socket.join(roomId.toString());
      
      (async() => {
        try{
          const room = await getRoomInfo({room_id: roomId, IsDeleted: false});
          if(playerNumber && room){
            const resultingPlayer = playerInRoom.find(entry => entry.roomId === room._id.toString() && entry.playerId === playerId.toString());
            if(!resultingPlayer){
              playerInRoom = [...playerInRoom, {roomId: room._id.toString(), playerId: playerId.toString(), playerNumber, socket}];
            }else { 
              const player_idx = playerInRoom.indexOf(resultingPlayer);
              playerInRoom[player_idx].socket = socket;
              socket.broadcast.to(roomId.toString()).emit('disconnect-other-tabs', {player: playerNumber, roomId: room._id.toString(), socketIdNot: socket.id});
            }
          }
          
          io.in(roomId.toString()).emit("update-room", room);
        } catch(e) {
          console.log(e);
          io.emit('room-processing-error', e);
        }
      })();
      
    });

    socket.on("send-chat-message", async ({ roomId, message, username }) => {
      let chat = await Chat.findOne({ roomId: roomId});

      if (!chat) {
        chat = await Chat.createNew(roomId);
      }

      chat.messages.push({
        username: username,
        message: message,
      });

      await chat.save();

      io.in(roomId.toString()).emit("update-chat", chat);
    })

    socket.on('leave-room', ({roomId, playerNumber, player}) => {
      console.log('someone left the room: ', roomId.toString());
      console.log('player Number:', playerNumber, ' playerInfo:', player, ' has left room');
      socket.leave(roomId.toString());

      try{
        if((playerNumber === 1 || playerNumber === 2) && roomId && player){
          (async() => {
            try{
              let room = await getRoomInfo({room_id: roomId.toString(), IsDeleted: false});
              const resultingPlayer = playerInRoom.find(entry => entry.roomId === roomId.toString() && entry.playerId === player._id.toString());
              if(resultingPlayer){
                const foundIdx = playerInRoom.indexOf(resultingPlayer);
                playerInRoom.splice(foundIdx, 1);

                let deleteRoom;
                if(playerNumber === 1){ 
                  deleteRoom = !room.Player2 ? true : false;
                }else if (playerNumber === 2){
                  deleteRoom = !room.Player1 ? true : false;
                }

                //get currentGame of the room and update it
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
          })();
        }  
      } catch (e) {
        console.log(e);
        io.emit('room-processing-error', e);
      }
    });

    socket.on("login", async (userId) => {
      await handleLogin(socket, userId);
    });

    socket.on("logout", () => {
      handleLogout(socket)
    })

    socket.on('enter matchmaking queue', () => {
      const userId = allUserIds[socket.id.toString()];

      if (userId) {
        socket.join('ping instances of user ' + userId);
        if(matchMakingQueue.indexOf(userId) === -1){
          matchMakingQueue.push(userId);
          console.log('new one enter matchmake queue', matchMakingQueue);
        }
        io.to('ping instances of user ' + userId).emit('is-matchmaking', {state: true});
        if(matchMakingQueue.length >= 2){
          const user1 = matchMakingQueue[0];
          const user2 = matchMakingQueue[1]; 
          
          matchMakingQueue.splice(0, 2);
          console.log('one person exited matchmake queue', matchMakingQueue);

          // Ping matchmaking state to all user that is popped from queue
          io.to('ping instances of user ' + user1).emit('matchmake-success', {yourUserId: user1});
          io.to('ping instances of user ' + user2).emit('matchmake-success', {yourUserId: user2});
        }
      }
      
    });

    socket.on('accept matchmake', ({myUserId}) => {
      if(myUserId){
        socket.join('ping instances of user ' + myUserId);
        if(createRoomQueue.indexOf(myUserId) === -1){
          createRoomQueue.push(myUserId);
          console.log('new one enter create room queue',createRoomQueue);
        }
        io.to('ping instances of user ' + myUserId).emit('is-waiting-create-room', {state: true});
        if(createRoomQueue.length >= 2){
          const value1 = createRoomQueue[0];
          const value2 = createRoomQueue[1];
          createRoomQueue.splice(0, 2);

          //Async create room
          (async() => {
            try{
              const user1 = await User.findById(value1);
              const user2 = await User.findById(value2);
              
              const creatingUser = parseInt(Math.floor(Math.random() * (2 - 1 + 1) + 1));
              
              let newRoom = await AddNewRoom({room_name: 'Cùng chơi nào~~~~', room_type: 1, createdBy: creatingUser === 1 ? user1 : user2});
              newRoom = await updateRoomInfo({room_id: (newRoom[0]._id).toString(), updatedBy: creatingUser === 1 ? user1 : user2, Player1: user1, Player2: user2});
              
              console.log('two person exited create room queue', createRoomQueue);

              io.emit('one-room-got-updated', await getAllRooms({}));

              io.to('ping instances of user ' + user1._id.toString()).emit('room-create-success', {yourRoom: newRoom});
              io.to('ping instances of user ' + user2._id.toString()).emit('room-create-success', {yourRoom: newRoom});
            }catch(e) {
              console.log(e);
              io.emit('room-processing-error', e);
            }
          })();
        }
      }
    });

    socket.on("disconnect", (reason) => {
      const i = allClients.indexOf(socket);
      const item = allClients.splice(i, 1)[0];

      handleLogout(socket);

      if (reason === 'ping timeout' || reason === 'transport close' || reason === 'io client disconnect'
        || reason === 'transport error') {
        const resultingPlayer = playerInRoom.find(entry => entry.socket.id === item.id);
        if(resultingPlayer) {
          (async() => {
            const foundIdx = playerInRoom.indexOf(resultingPlayer);
            playerInRoom.splice(foundIdx, 1);
            // remove from db if needed
            try{
              let room = await getRoomInfo({room_id: resultingPlayer.roomId, IsDeleted: false});
              const user = await User.findById(resultingPlayer.playerId);
              let deleteRoom;
              if(resultingPlayer.playerNumber === 1){ 
                deleteRoom = !room.Player2 ? true : false;
              }else if (resultingPlayer.playerNumber === 2){
                deleteRoom = !room.Player1 ? true : false;
              }

              if(!deleteRoom){
                room = resultingPlayer.playerNumber === 2 ? 
                await updateRoomInfo({room_id: room._id.toString(), updatedBy: user, Player2: null})
                : await updateRoomInfo({room_id: room._id.toString(), updatedBy: user, Player1: null});
                io.emit('one-room-got-updated', await getAllRooms({}));
              }else {
                await updateRoomInfo({room_id: room._id.toString(), updatedBy: user, Player1: null, Player2: null, IsDeleted: deleteRoom});
                room = await deleteExistingRoom({room_id: room._id.toString(), updatedBy: user});
                io.emit('one-room-got-deleted', await getAllRooms({}));
              };
              io.in(room._id.toString()).emit('update-room', room);
            } catch(e) {
              console.log(e);
              io.emit('room-processing-error', e);
            }
          })();
        }  
      }

      console.log("client disconnect");
    });
  });
};
