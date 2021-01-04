const mongoose = require("mongoose");

const RoomTypeSchema = new mongoose.Schema(
    {
        NumberId: {
            type: mongoose.Schema.Types.Number,
            required: "Your room type needs an identifier for query",
            unique: true,
            index: true,
        },
        Name: {
            type: mongoose.Schema.Types.String,
            required: "Your room type needs a name of the type",
            max: 100,
        },
    }, { timestamps: true }
);

const RoomType = mongoose.model('RoomTypes', RoomTypeSchema);

module.exports = RoomType; 