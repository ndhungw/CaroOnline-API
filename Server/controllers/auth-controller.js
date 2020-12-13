const User = require("../models/user-model");
const authController = {};

/**
 * @route POST api/auth/register
 * @description Register new user
 * @access Public
 */
authController.register = async (req, res) => {
  // make sure this account doesn't already exist
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      return res.status(401).json({
        message:
          "The email address you have entered is already associated with another account.",
      });
    }

    // Create and save the new user
    const newUserToSave = new User(req.body);

    try {
      const newUser = await newUserToSave.save();
      res.status(200).json({ token: newUser.generateJWT(), user: newUser });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } catch (err) {
    // get err in find the already exist user
    return res.status(500).json({ success: false, message: err.message });
  }
};

authController.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({
        message: `The email address ${email} is not associated with any account. Double-check your email address and try again.`,
      });
    }

    // validate password
    if (!user.comparePassword(password))
      return res.status(401).json({ message: "Invalid password" });

    // login successful, write token and send back to user
    res.status(200).json({ token: user.generateJWT(), user: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = authController;
