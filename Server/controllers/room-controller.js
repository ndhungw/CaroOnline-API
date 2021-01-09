const roomService = require('../services/roomService');
const {ROOM_SERVICE_ERROR} = require("../constants/constants");

// TO DO
module.exports.createNewRoom = async(req, res, next) => {
    const {user} = req;
    const {room_type, room_name, room_description, room_password} = req.body;

    const io = req.ioSocket;

    try
    {
        const newRoom = await roomService.AddNewRoom({room_name, room_description, room_type, createdBy: user, room_password});
        io.to('index-page').emit('new-room-created', {rooms: await roomService.getAllRooms({})});
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