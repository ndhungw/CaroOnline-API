const User = require("../models/user-model");
const authController = {};
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * @route POST api/auth/register
 * @description Register new user
 * @access Public
 */
authController.register = async (req, res) => {
  const email = req.body.email;
  // make sure this account doesn't already exist
  try {
    const user = await User.findOne({ email: email });

    if (user) {
      return res.status(401).json({
        message:
          "The email address you have entered is already associated with another account.",
      });
    }

    // Create and save the new user
    const newUserToSave = new User(req.body);

    try {
      await newUserToSave.generateActivationToken();
      const newUser = await newUserToSave.save();

      // Attempt to send activation email
      const link =
        "http://" +
        // req.headers.host +
        process.env.FRONTEND_DOMAIN +
        "/activate/" /* change this part to 'a link of front end' which will render an ACTIVATION VIEW */ +
        newUser.activationToken;
      const mailOptions = {
        to: newUser.email,
        from: process.env.FROM_EMAIL,
        subject: "ACTIVATE YOUR ACCOUNT",
        text: `Hi ${newUser.username} \nPlease click on the following link ${link} to activate your account.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };

      await sgMail.send(mailOptions, (err, result) => {
        if (err) {
          return res.status(500).json({ message: error.message });
        }
      });
      res.status(200).json({
        token: newUser.generateJWT(),
        user: newUser,
        message: `An activation email has been sent to ${email}`,
      });
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

authController.activate = async (req, res) => {
  const activationToken = req.params.activationToken;

  try {
    const user = await User.findOne({
      activationToken: activationToken,
    });

    // update active status
    user.active = true;
    user.activationToken = undefined;

    const activatedUser = await user.save();

    return res.status(200).json({
      message: "Your account has been activated.",
      user: activatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = authController;
