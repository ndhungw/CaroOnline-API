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
            else {
                //save for game viewer
            }
        }

        console.log(playerNumber);

        let currentGame = null;
        if (desiredRoom.CurrentGame) {
            currentGame = await Game.findById(desiredRoom.CurrentGame);
        }

        res.status(200).json({currentGame: currentGame, playerNumber: playerNumber});
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
    try
    {
        res.status(501).json({message: "Not implemented this route yet"});
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
    try
    {
        res.status(501).json({message: "Not implemented this route yet"});
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