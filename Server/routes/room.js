const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room-controller");
const authenticate = require("../middlewares/authenticate");

module.exports = function(app){
    const setIO = (req, res, next) => {
        req.ioSocket = app.get("io");
        next();
    };
    // C
    router.post("/room", authenticate, setIO, roomController.createNewRoom);
    // R
    router.get("/rooms", roomController.getAllRooms);
    router.get("/room/:roomId", roomController.getOneRoom);
    // U
    router.put("/room/:roomId", authenticate, setIO, roomController.updateRoomInfo);
    // D
    router.delete("/room/:roomId", authenticate, setIO, roomController.deleteRoom);

    //JOIN ROOM
    router.get("/room/join/:roomId", authenticate, roomController.joinRoom);

    return router;
}
