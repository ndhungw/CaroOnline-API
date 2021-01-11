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
        exception.status_code = 400;
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
            Player1: resultUser._id,
            IsDeleted: false,
        }], {session: session});
        
        // Populate needed fields
        for(const entry of newRooms){
            await entry.populate("CreatedBy").populate("UpdatedBy").populate("Player1").populate("Player2").populate("RoomType").execPopulate();
        } 
        for(const entry of newRooms){
            // Set all password to undefined to prevent data breach
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

module.exports.getAllRooms = async({page_number, item_per_page}) => {
    const documentsCount = await Room.estimatedDocumentCount();
    // if no provide item per page, we get all
    if(!item_per_page || !page_number){
        const rooms = await Room.find({IsDeleted: false}).exec();
        return rooms;
    }
    // Otherwise, we get the page
    const currentAmountOfRoomPagesInDatabase = parseInt(Math.ceil(documentsCount/item_per_page));
    if(page_number > currentAmountOfRoomPagesInDatabase && currentAmountOfRoomPagesInDatabase !== 0){
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Provided page_number to fetch is invalid";
        exception.newMaxPage = currentAmountOfRoomPagesInDatabase;
        throw exception;
    }
    const fetchedDocuments = await Room.find({IsDeleted: false}).skip((page_number-1)*item_per_page).limit(item_per_page).exec();
    return fetchedDocuments;
}

module.exports.getRoomInfo = async({room_id}) => {
    if(!room_id){
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Cannot get room info without an id";
        throw exception;
    }
    const roomInfo = await Room.findById(room_id)
    .populate("Player1", "username")
    .populate("Player2", "username").exec();
    if(!roomInfo){
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Found no room with the id";
        throw exception;
    }
    await roomInfo.populate("CreatedBy").populate("UpdatedBy").populate("Player1").populate("Player2").populate("RoomType").execPopulate();
    return roomInfo;
}

module.exports.checkRoomPassword = async ({room_id, room_password}) => {
    if(!room_id){
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Cannot check password for room without an id";
        throw exception;
    }
    if(!room_password){
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Cannot check password if you dont provide a password to check for";
        throw exception;
    }
    const roomInfo = await Room.findById(room_id);
    if(!roomInfo || roomInfo.IsDeleted){
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Found no room with the id";
        throw exception;
    }
    await roomInfo.populate("RoomType").execPopulate();
    if(roomInfo.RoomType.NumberId === PRIVATE_ROOM_ID){
        const result = await bcrypt.compare(room_password, roomInfo.Password, null);
        if(!result){
            const exception = new Error();
            exception.name = ROOM_SERVICE_ERROR;
            exception.message = "Password doesn't match!!";
            throw exception;
        }
        if(roomInfo.Player1 && roomInfo.Player2){
            const exception = new Error();
            exception.name = ROOM_SERVICE_ERROR;
            exception.message = "Private room is full, cannot join";
            throw exception;
        }
    }
}

module.exports.updateRoomInfo = async ({room_id, room_name, room_description, updatedBy, room_type, new_room_password, password, IsPlaying, CurrentGame, Player1, Player2}) => {
    
    if(!updatedBy) {
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Room has to be updated by someone";
        throw exception;
    }
    if(!room_id) {
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Need room id to update";
        throw exception;
    }
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
        // First find the room
        const roomToUpdate = await Room.findById(room_id).session(session).exec();
        if(!roomToUpdate) {
            const exception = new Error();
            exception.name = ROOM_SERVICE_ERROR;
            exception.message = "Room is not valid to update";
            throw exception;
        }

        // check the validity of the user this is updatedBy
        const resultUser = await User.findById(updatedBy._id).session(session).exec();
        if(!resultUser){
            const exception = new Error();
            exception.name = ROOM_SERVICE_ERROR;
            exception.message = "Provided user that updates the room is invalid";
            throw exception;
        }
        roomToUpdate.UpdatedBy = resultUser._id;

        // check the validity of room type
        if(room_type){
            const resultRoomType = await RoomType.findOne({NumberId: room_type}).session(session).exec();
            if(!resultRoomType){
                const exception = new Error();
                exception.name = ROOM_SERVICE_ERROR;
                exception.message = "Provided room_type is invalid";
                throw exception;
            }
            if(resultRoomType._id.toString() !== roomToUpdate.RoomType.toString()) {
                //Got changed to private room
                if(resultRoomType.NumberId === PRIVATE_ROOM_ID){
                    if(!password){
                        const exception = new Error();
                        exception.name = ROOM_SERVICE_ERROR;
                        exception.message = "Private room needs a password";
                        throw exception;
                    }
                    roomToUpdate.Password = await bcrypt.hash(password, 10, null);
                    roomToUpdate.RoomType = resultRoomType._id;
                }else if (resultRoomType.NumberId === PUBLIC_ROOM_ID){
                    roomToUpdate.RoomType = resultRoomType._id;
                    roomToUpdate.Password = null;
                }
            }
        } else if (new_room_password && new_room_password.length >= 6 && new_room_password.length <= 36) {
            const resultRoomType = await RoomType.findById(roomToUpdate.RoomType).session(session).exec();
            if(!resultRoomType){
                const exception = new Error();
                exception.name = ROOM_SERVICE_ERROR;
                exception.message = "Cannot find room type from record reference";
                throw exception;
            }
            if(resultRoomType.NumberId === PRIVATE_ROOM_ID && resultUser._id.toString() === roomToUpdate.Player1.toString()){
                roomToUpdate.Password = await bcrypt.hash(new_room_password, 10, null);
            }
        }
        
        if(IsPlaying !== undefined && IsPlaying !== null){
            roomToUpdate.IsPlaying = IsPlaying;
        }

        if(room_name && room_name.length <= 100){
            roomToUpdate.Name = room_name;
        }

        if(room_description && room_description.length <= 200){
            roomToUpdate.Description = romm_description;
        }

        if(CurrentGame){
            const old_game = roomToUpdate.CurrentGame;
            const new_game = await Game.findById(CurrentGame).session(session).exec();
            if(!new_game){
                const exception = new Error();
                exception.name = ROOM_SERVICE_ERROR;
                exception.message = "New current game id is invalid";
                throw exception;
            }
            roomToUpdate.CurrentGame = new_game._id;
            roomToUpdate.PlayedGames = [...roomToUpdate.PlayedGames, old_game];
        }

        if(Player1){
            const resultUser = await User.findById(Player1).session(session).exec();
            if(!resultUser){
                const exception = new Error();
                exception.name = ROOM_SERVICE_ERROR;
                exception.message = "Provided player 1 in the room is invalid";
                throw exception;
            }
            roomToUpdate.Player1 = resultUser._id;
        }

        if(Player2 || Player2 === null){
            if(Player2){
                const resultUser = await User.findById(Player2).session(session).exec();
                if(!resultUser){
                    const exception = new Error();
                    exception.name = ROOM_SERVICE_ERROR;
                    exception.message = "Provided player 2 in the room is invalid";
                    throw exception;
                }
                roomToUpdate.Player2 = resultUser._id;
            } else if (Player2 === null) {
                roomToUpdate.Player2 = null;
            }
        }

        // If save room after all updates
        await roomToUpdate.save();

        // Populate needed fields
        await roomToUpdate.populate("CreatedBy").populate("UpdatedBy").populate("Player1").populate("Player2").populate("RoomType").execPopulate();
        await session.commitTransaction();
        session.endSession();
        roomToUpdate.Password = undefined;
        roomToUpdate.CreatedBy? (roomToUpdate.CreatedBy.password = undefined) :  null;
        roomToUpdate.UpdatedBy? (roomToUpdate.UpdatedBy.password = undefined) :  null;
        roomToUpdate.Player1? (roomToUpdate.Player1.password = undefined) : null;
        roomToUpdate.Player2? (roomToUpdate.Player2.password = undefined) : null;
        return roomToUpdate;
    } catch (e) {
        await session.abortTransaction();
        session.endSession();
        throw e;
    }
}

module.exports.deleteRoom = async ({room_id, updatedBy}) => {
    if(!updatedBy) {
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Room has to be updated by someone";
        throw exception;
    }
    if(!room_id) {
        const exception = new Error();
        exception.name = ROOM_SERVICE_ERROR;
        exception.message = "Need room id to update";
        throw exception;
    }
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
        // First find the room
        const roomToUpdate = await Room.findById(room_id).session(session).exec();
        if(!roomToUpdate) {
            const exception = new Error();
            exception.name = ROOM_SERVICE_ERROR;
            exception.message = "Room is not valid to update";
            throw exception;
        }

        // check the validity of the user this is updatedBy
        const resultUser = await User.findById(updatedBy._id).session(session).exec();
        if(!resultUser){
            const exception = new Error();
            exception.name = ROOM_SERVICE_ERROR;
            exception.message = "Provided user that updates the room is invalid";
            throw exception;
        }
        roomToUpdate.UpdatedBy = resultUser._id;

        roomToUpdate.IsDeleted = true;

        // If save room after all updates
        await roomToUpdate.save();

        // Populate needed fields
        await roomToUpdate.populate("CreatedBy").populate("UpdatedBy").populate("Player1").populate("Player2").populate("RoomType").execPopulate();
        await session.commitTransaction();
        session.endSession();
        // Set all password to undefined to prevent data breach
        roomToUpdate.Password = undefined;
        roomToUpdate.CreatedBy? (roomToUpdate.CreatedBy.password = undefined) :  null;
        roomToUpdate.UpdatedBy? (roomToUpdate.UpdatedBy.password = undefined) :  null;
        roomToUpdate.Player1? (roomToUpdate.Player1.password = undefined) : null;
        roomToUpdate.Player2? (roomToUpdate.Player2.password = undefined) : null;   
        return roomToUpdate;
    } catch (e) {
        await session.abortTransaction();
        session.endSession();
        throw e;
    }
}