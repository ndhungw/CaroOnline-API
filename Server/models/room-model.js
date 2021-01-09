const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
    {
        Name: {
            type: mongoose.Schema.Types.String,
            required: "Your room need to have a name",
            maxlength: 100,
        },
        RoomType: {
            type: mongoose.Schema.Types.ObjectId,
            required: "Your room needs to have a type (either private or public)",
            ref: 'RoomTypes'
        },
        Description: {
            type: mongoose.Schema.Types.String,
            maxlength: 200,
            default: null
        },
        Password: {
            type: mongoose.Schema.Types.String,
            maxlength: 256,
            default: null,
        },
        IsPlaying: {
            type: mongoose.Schema.Types.Boolean,
            default: false,
        },
        IsDeleted: {
            type: mongoose.Schema.Types.Boolean,
            default: false,
        },

        CurrentGame: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            index: true,
            ref: 'Game'
        },
        PlayedGames: [{
            type: mongoose.Schema.Types.ObjectId,
            index: true,
            ref: 'Game'
        }],

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
        // Playing slots or a room (2 of them)
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

const Room = mongoose.model('Rooms', RoomSchema);

module.exports = Room;