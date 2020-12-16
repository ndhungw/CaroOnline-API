const Room = require('../models/room-model');
const RoomType = require('../models/room-type-model')
const {ROOM_SERVICE_ERROR, PRIVATE_ROOM_ID} = require("../constants/constants");
const mongoose = require("mongoose");
const User = require('../models/user-model');
const bcrypt = require("bcrypt");

module.exports.AddNewRoom = async ({room_name, room_description, room_type, createdBy, room_password}) => {
    if(!room_name) {
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Cannot create a new room without a name";
        throw exception;
    }
    if(!createdBy) {
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Room has to have a creator";
        throw exception;
    }
    if(!room_type) {
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Room has to have a type";
        throw exception;
    }
    if(typeof room_password !== "string") {
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Room password is not a string";
        throw exception;
    }
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
        // check the validity of room type
        const resultRoomType = await RoomType.findOne({NumberId: room_type}).session(session).exec();
        if(resultRoomType == null){
            const exception = new Error();
            exception.name = ROOM_SERVICE_ERROR;
            exception.message = "Provided room_type is invalid";
            throw exception;
        }
        // If room is private (NumberId is 2)
        if(resultRoomType.NumberId == PRIVATE_ROOM_ID && !room_password){
            const exception = new Error();
            exception.name = ROOM_SERVICE_ERROR;
            exception.message = "Private room needs a password";
            throw exception;
        }
        // check the validity of the user this is createdBy
        const resultUser = await User.findById(createdBy._id).session(session).exec();
        if(resultUser == null){
            const exception = new Error();
            exception.name = ROOM_SERVICE_ERROR;
            exception.message = "Provided user that creates the room is invalid";
            throw exception;
        }
        // If passes all tests, create new room
        let newRooms = await Room.create([{
            Name: room_name,
            Description: room_description,
            RoomType: resultRoomType._id,
            Password: room_password ? await bcrypt.hash(room_password, 10, null) : null,
            IsPlaying: false,
            CreatedBy: resultUser._id,
            UpdatedBy: resultUser._id,
            Player1: resultUser._id
        }], {session: session});
        // Populate needed fields
        for(const entry of newRooms){
            await entry.populate("CreatedBy").populate("UpdatedBy").populate("Player1").populate("Player2").populate("RoomType").execPopulate();
            // Set all password to undefined to prevent data breach
            entry.Password = undefined;
            entry.CreatedBy? (entry.CreatedBy.password = undefined) :  null;
            entry.UpdatedBy? (entry.UpdatedBy.password = undefined) :  null;
            entry.Player1? (entry.Player1.password = undefined) : null;
            entry.Player2? (entry.Player2.password = undefined) : null;
        }
        await session.commitTransaction();
        session.endSession();
        return newRooms;
    } catch (e) {
        await session.abortTransaction();
        session.endSession();
        throw e;
    }
}

module.exports.getAllRooms = async({}) => {

}