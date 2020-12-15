const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
    {
        Name: {
            type: mongoose.Schema.Types.String,
            required: "Your room need to have a name",
            max: 100,
        },
        IsPlaying: {
            type: mongoose.Schema.Types.Boolean,
            default: false,
        },
        //Reference fields
        CreatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            index: true,
            ref: 'Users'
        },
        UpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            index: true,
            ref: 'Users'
        },
            // Playing slot or a room (2 of them)
        Player1: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: 'Users'
        },
        Player2: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: 'Users'
        }
    }, { timestamps: true }
);

module.exports.Room = mongoose.model('Room', RoomSchema);