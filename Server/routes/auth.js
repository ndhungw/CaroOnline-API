const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const validate = require("../middlewares/validate");
const Auth = require("../controllers/auth-controller");

router.get("/", (req, res) => {
  res.status(200).json({ message: "You are in the Auth Endpoint." });
});

router.post(
  "/register",
  [
    check("email").isEmail().withMessage("Enter a valid email address"),
    check("username").not().isEmpty().withMessage("Your username is required"),
    check("password")
      .not()
      .isEmpty()
      .isLength({ min: 6 })
      .withMessage("Must be at least 6 characters long"),
    check("firstName")
      .not()
      .isEmpty()
      .withMessage("Your first name is required"),
    check("lastName").not().isEmpty().withMessage("Your last name is required"),
  ],
  validate,
  Auth.register
);

router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Enter a valid email address"),
    check("password").not().isEmpty(),
  ],
  validate,
  Auth.login
);

module.exports = router;
