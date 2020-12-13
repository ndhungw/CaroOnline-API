/**
 * We’re making use of memory storage instead first writing the file to an upload/ directory.
 * This is because when we deploy our application to Heroku, we may not have the administrative
 * privileges to write files to the remote computer which may crash our entire application.
 */
const multer = require("multer");
const storage = multer.memoryStorage();
//.single('image') specifies the field name multer should go to when it’s looking for the file.
const multerUploads = multer({ storage: storage }).single("image");

module.exports = { multerUploads };
