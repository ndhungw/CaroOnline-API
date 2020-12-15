const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room-controller");

// C
router.post("/room", roomController.createNewRoom);
// R
router.get("/rooms", roomController.getAllRooms);
router.get("/room/:roomId", roomController.getOneRoom);
// U
router.put("/room/:roomId", roomController.updateRoomInfo);
// D
router.delete("/room/:roomId", roomController.deleteRoom);

module.exports = router;
