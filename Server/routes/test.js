const express = require("express");
const router = express.Router();
const { uploader } = require("../config/cloudinary"); // import the uploader from cloudinary (has been configured)

/**
 * multerUploads: catch the file uploaded from client-side.
 * dataUri: a middleware that converts the buffer to data uri
 */
const { multerUploads } = require("../middlewares/multer");
const { dataUri } = require("../middlewares/dataUri");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* POST upload image - a testing route for uploading image feature */
router.post("/upload", multerUploads, async (req, res) => {
  if (req.file) {
    const file = dataUri(req);
    try {
      const result = await uploader.upload(file);
      const imageURL = result.url;
      return res.status(200).json({
        message: "Your image has been uploaded successfully to cloudinary.",
        imageURL,
      });
    } catch (err) {
      res.status(400).json({
        message: "Something went wrong while processing your request.",
        data: {
          err,
        },
      });
    }
  }
});

module.exports = router;
