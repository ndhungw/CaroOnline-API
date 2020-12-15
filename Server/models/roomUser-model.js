const mongoose = require("mongoose");

/* This signify a user's connection to a room
    1. When the user enter the room the first time, a new record will be inserted in this table with isParticipating default "true"
    2. When the user leave the room, the existing record's IsParticipating field will be changed to "false"
    3. When the user enter the room the second/third/"nth" time, the existing record's IsParticipating field will be changed to "true"
*/

const RoomUserSchema = new mongoose.Schema(
    {
        RoomId: {
            type: mongoose.Schema.Types.ObjectId,
            required: "Your room participation need to references a room",
            index: true,
        },
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            required: "Your room participation need to references a user",
            index: true,
        },
        IsParticipating: {
            type: mongoose.Schema.Types.Boolean,
            required: "Your room participation status should be provided",
            default: true,
        }      
    }, { timestamps: true }
);

module.exports.Room_User = mongoose.model('Room_User', RoomUserSchema);