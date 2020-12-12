const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");

/* GET users listing. */
router.get("/", userController.getAll);
router.post("/", userController.add);
router.get("/{id}", userController.get);
router.put("/{id}", userController.update);
router.delete("/{id}", userController.delete);
// router.post("/upload", userController.upload);

module.exports = router;
