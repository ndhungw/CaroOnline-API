const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room-controller");
const authenticate = require("../middlewares/authenticate");

// C
router.post("/room", authenticate, roomController.createNewRoom);
// R
router.get("/rooms", roomController.getAllRooms);
router.get("/room/:roomId", roomController.getOneRoom);
// U
router.put("/room/:roomId", authenticate, roomController.updateRoomInfo);
// D
router.delete("/room/:roomId", authenticate, roomController.deleteRoom);

module.exports = router;
