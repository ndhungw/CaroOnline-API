const Room = require('../models/room-model');
const RoomType = require('../models/room-type-model')
const {ROOM_SERVICE_ERROR, PRIVATE_ROOM_ID} = require("../constants/constants");
const mongoose = require("mongoose");
const User = require('../models/user-model');
const bcrypt = require("bcrypt");

module.exports.AddNewRoom = async ({room_name, room_description, room_type, createdBy, room_password}) => {
    if(!room_name) {
        const exception = new Error("Cannot create a new room without a name");
        exception.name = ROOM_SERVICE_ERROR;
        throw exception;
    }
    if(!createdBy) {
        const exception = new Error("Room has to have a creator");
        exception.name = ROOM_SERVICE_ERROR;
        throw exception;
    }
    if(!room_type) {
        const exception = new Error("Room has to have a type");
        exception.name = ROOM_SERVICE_ERROR;
        throw exception;
    }
    if(typeof room_password !== "string") {
        const exception = new Error("Room password is not a string");
        exception.name = ROOM_SERVICE_ERROR;
        throw exception;
    }
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
        // check the validity of room type
        const resultRoomType = await RoomType.findOne({NumberId: room_type}).session(session).exec();
        if(resultRoomType == null){
            const exception = new Error("Provided room_type is invalid");
            exception.name = ROOM_SERVICE_ERROR;
            throw exception;
        }
        // If room is private (NumberId is 2)
        if(resultRoomType.NumberId == PRIVATE_ROOM_ID && !room_password){
            const exception = new Error("Private room needs a password");
            exception.name = ROOM_SERVICE_ERROR;
            throw exception;
        }
        // check the validity of the user this is createdBy
        const resultUser = await User.findById(createdBy._id,).session(session).exec();
        if(resultUser == null){
            const exception = new Error("Provided user that creates the room is invalid");
            exception.name = ROOM_SERVICE_ERROR;
            throw exception;
        }
        // If passes all tests, create new room
        const newRoom = await Room.create([{
            Name: room_name,
            Description: room_description,
            RoomType: resultRoomType._id,
            Password: room_password ? await bcrypt.hash(room_password, 10, null) : null,
            IsPlaying: false,
            CreatedBy: resultUser._id,
            UpdatedBy: resultUser._id,
            Player1: resultUser._id
        }], {session: session});

        await session.commitTransaction();
        session.endSession();
        return newRoom;
    } catch (e) {
        await session.abortTransaction();
        session.endSession();
        throw e;
    }
    
}