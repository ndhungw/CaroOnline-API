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

// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post("/sendMail", async (req, res) => {
  const msg = {
    to: req.body.email, // Change to your recipient
    from: process.env.FROM_EMAIL, // Change to your verified sender
    subject: "Sending with SendGrid is Fun",
    text: "text text text text text text ",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
      return res.status(200).json({ message: "Email sent successfully" });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({ message: "Email sent failed" });
    });
});
module.exports = router;
