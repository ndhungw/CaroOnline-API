const roomService = require('../services/roomService');
const {ROOM_SERVICE_ERROR} = require("../constants/constants");
const Game = require('../models/game-model');

// TO DO
module.exports.createNewRoom = async(req, res, next) => {
    const {user} = req;
    const {room_type, room_name, room_description, room_password} = req.body;

    const io = req.ioSocket;

    try
    {
        const newRoom = await roomService.AddNewRoom({room_name, room_description, room_type, createdBy: user, room_password});
        io.emit('new-room-created', await roomService.getAllRooms({}));
        res.status(200).json({message: "Successfully created a new room", data: newRoom});
    }
    catch(e)
    {
        console.log(e);
        if(e.name && e.name === ROOM_SERVICE_ERROR){
            res.status(400).json({message: "Server encountered an exception while processing your request", data: e});
            return;
        }
        res.status(500).json({message: "Server encountered an internal error, please report to the one responsible for making this server"});
    }
}

// TO DO
module.exports.getAllRooms = async(req, res, next) => {
    const {page_number, item_per_page} = req.query;
    try
    {
        res.status(200).json({message: "here are the rooms", data: await roomService.getAllRooms({page_number, item_per_page})});
    }
    catch(e)
    {
        console.log(e);
        if(e.name && e.name === ROOM_SERVICE_ERROR){
            res.status(400).json({message: "Server encountered an exception while processing your request", data: e});
        }
        res.status(500).json({message: "Server encountered an internal error, please report to the one responsible for making this server"});
    }   
}

// TO DO
module.exports.getOneRoom = async(req, res, next) => {
    const {roomId} = req.params;
    try
    {
        res.status(200).json({message: "your room info", data: await roomService.getRoomInfo({room_id: roomId})});
    }
    catch(e)
    {
        if(e.name && e.name === ROOM_SERVICE_ERROR){
            res.status(400).json({message: "Server encountered an exception while processing your request", data: e});
            return;
        }
        res.status(500).json({message: "Server encountered an internal error, please report to the one responsible for making this server"});
    }   
}

module.exports.joinRoom = async(req, res) => {
    const {roomId} = req.params;
    try
    {
        const desiredRoom = await roomService.getRoomInfo({room_id: roomId});
        let playerNumber = 0;

        if(req.user){
            // if ((desiredRoom.Player1._id).toString() === (req.user._id).toString()) {
            //     desiredRoom.Player1 = req.user._id;
            //     playerNumber = 1;
        
        if ((desiredRoom.CreatedBy._id).toString() === (req.user._id).toString()) {
            desiredRoom.Player1 = req.user._id;
            playerNumber = 1;
        }
        else {
            if (!desiredRoom.Player2) {
                desiredRoom.Player2 = req.user._id;
                playerNumber = 2;
            }
            else if ((desiredRoom.Player2._id).toString() === (req.user._id).toString()) {
                desiredRoom.Player2 = req.user._id;
                playerNumber = 2;
            }

            await desiredRoom.save();

            // Set all password to undefined to prevent data breach
            desiredRoom.Password = undefined;
            desiredRoom.CreatedBy? (desiredRoom.CreatedBy.password = undefined) :  null;
            desiredRoom.UpdatedBy? (desiredRoom.UpdatedBy.password = undefined) :  null;
            desiredRoom.Player1? (desiredRoom.Player1.password = undefined) : null;
            desiredRoom.Player2? (desiredRoom.Player2.password = undefined) : null;
        }
        }

        let currentGame = null;
        if (desiredRoom.CurrentGame) {
            currentGame = await Game.findById(desiredRoom.CurrentGame);
        }

        res.status(200).json({
            room: desiredRoom, 
            username: req.user.username, 
            currentGame: currentGame, 
            playerNumber: playerNumber});
    }
    catch(e)
    {
        if(e.name && e.name === ROOM_SERVICE_ERROR){
            res.status(400).json({message: "Server encountered an exception while processing your request", data: e});
            return;
        }
        console.log(e);
        res.status(500).json({message: "Server encountered an internal error, please report to the one responsible for making this server"});
    }   
}

module.exports.updateRoomInfo = async(req, res, next) => {
    const {roomId} = req.params;
    const {user} = req;
    const io = req.ioSocket;

    const {room_name, room_description, room_type, new_room_password, password, IsPlaying, CurrentGame, Player1, Player2} = req.body;

    try
    { 
        const updatedRoom = await roomService.updateRoomInfo({room_id: roomId, updatedBy: user, room_name, room_description, room_type, new_room_password, password, IsPlaying, CurrentGame, Player1, Player2});
        io.in(roomId).emit('update-room', {room: updatedRoom});
        io.emit('one-room-got-updated', await roomService.getAllRooms({}));
        res.status(200).json({message: "Updated the specified room", data: updatedRoom});
    }
    catch(e)
    {
        console.log(e);
        if(e.name && e.name === ROOM_SERVICE_ERROR){
            res.status(400).json({message: "Server encountered an exception while processing your request", data: e});
            return;
        }
        res.status(500).json({message: "Server encountered an internal error, please report to the one responsible for making this server"});
    }   
}

module.exports.deleteRoom = async(req, res, next) => {
    const {roomId} = req.params;
    const {user} = req;

    const io = req.ioSocket;

    try
    {
        const deletedRoom = await roomService.deleteRoom({room_id: roomId, updatedBy: user});
        io.in(roomId).emit('update-room', {room: deletedRoom});
        io.emit('one-room-got-deleted', await roomService.getAllRooms({}));
        res.status(200).json({message: "Deleted the specified room", data: deletedRoom});
    }
    catch(e)
    {
        console.log(e);
        if(e.name && e.name === ROOM_SERVICE_ERROR){
            res.status(400).json({message: "Server encountered an exception while processing your request", data: e});
            return;
        }
        res.status(500).json({message: "Server encountered an internal error, please report to the one responsible for making this server"});
    }   
}