const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const validate = require("../middlewares/validate");
const Auth = require("../controllers/auth-controller");
const passwordController = require("../controllers/password-controller");
const authenticate = require("../middlewares/authenticate");

router.get("/", authenticate, (req, res) => {
  res
    .status(200)
    .json({ user: req.user, message: "You are in the Auth Endpoint." });
});

// REGISTER
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

// LOGIN
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Enter a valid email address"),
    check("password").not().isEmpty(),
  ],
  validate,
  Auth.login
);

router.post("/login-google", Auth.loginWithGoogle);

router.post("/login-facebook", Auth.loginWithFacebook);
// Password RESET
router.post(
  "/recover",
  [check("email").isEmail().withMessage("Enter a valid email address")],
  validate,
  passwordController.recover
);

// router.get("/reset/:token", passwordController.geResetView);

router.post(
  "/reset/:token",
  [
    check("password")
      .not()
      .isEmpty()
      .isLength({ min: 6 })
      .withMessage("Must be at least 6 chars long"),
    check("confirmPassword", "Passwords do not match").custom(
      (value, { req }) => value === req.body.password
    ),
  ],
  validate,
  passwordController.resetPassword
);

router.post("/activate/:activationToken", Auth.activate);

module.exports = router;
