const express = require("express");
const router = express.Router();
const userController = require("../../Server/controllers/user-controller");
const { multerUploads } = require("../middlewares/multer");

/* GET users listing. */
router.get("/", userController.getAll);
router.post("/", userController.add);
router.get("/:id", userController.get);
router.put("/:id", multerUploads, userController.update);
router.delete("/:id", userController.delete);

module.exports = router;
