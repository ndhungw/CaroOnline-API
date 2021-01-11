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
        io.to('index-page').emit('new-room-created', await roomService.getAllRooms({}));
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
        const result = await roomService.getAllRooms({page_number, item_per_page});
        res.status(200).json({message: "here are the rooms", data: result});
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
    const io = req.ioSocket;
    try
    {
        const desiredRoom = await roomService.getRoomInfo({room_id: roomId});
        let playerNumber = 0;
        
        if ((desiredRoom.CreatedBy).toString() === (req.user._id).toString()) {
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
        }

        await desiredRoom.save();

        console.log(playerNumber);

        let currentGame = null;
        if (desiredRoom.CurrentGame) {
            currentGame = await Game.findById(desiredRoom.CurrentGame);
        }

        res.status(200).json({room: desiredRoom, currentGame: currentGame, playerNumber: playerNumber});
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

module.exports.checkRoomJoinable = async (req, res, next) => {
    const {roomId} = req.params;

    const {room_password} = req.body;

    try
    {
        await roomService.checkRoomPassword({room_id: roomId, room_password});
        res.status(200).json({message: "You can join this room!!!"});
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

module.exports.updateRoomInfo = async(req, res, next) => {
    const {roomId} = req.params;
    const {user} = req;

    const io = req.ioSocket;

    const {room_name, room_description, room_type, new_room_password, password, IsPlaying, CurrentGame, Player1, Player2} = req.body;

    try
    { 
        const updatedRoom = await roomService.updateRoomInfo({room_id: roomId, updatedBy: user, room_name, room_description, room_type, new_room_password, password, IsPlaying, CurrentGame, Player1, Player2});
        io.emit('update-room', updatedRoom);
        res.status(200).json({message: "Updated the specified room", data: updatedRoom});
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

module.exports.deleteRoom = async(req, res, next) => {
    const {roomId} = req.params;
    const {user} = req;

    const io = req.ioSocket;

    try
    {
        const deletedRoom = await roomService.deleteRoom({room_id: roomId, updatedBy: user});
        io.to('index-page').emit('a-room-got-deleted', await roomService.getAllRooms({}));
        res.status(200).json({message: "Deleted the specified room", data: deletedRoom});
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