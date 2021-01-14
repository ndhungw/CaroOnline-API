const User = require("../models/user-model");
const passwordController = {};
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// PASSWORD RECOVER AND RESET

/**
 * @route POST api/auth/recover
 * @desc Recover password - Generates token and sends password reset email
 * @access Public
 */
passwordController.recover = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        message:
          "The email address ${email} is not associated with any account. Double-check your email address and try again.",
      });
    }

    // generate and set password reset token
    await user.generatePasswordReset();

    try {
      const userAfterSave = await user.save();
      console.log("user: ", user);
      console.log("userAfterSave: ", userAfterSave);

      // send mail
      console.log(
        " from password-controller, userAfterSave.resetPasswordToken: ",
        userAfterSave.resetPasswordToken
      );
      const link =
        "http://" +
        // req.headers.host +
        process.env.FRONTEND_DOMAIN +
        "/reset-password/" /* change this part to a link of front end which will render a view for typing reset password */ +
        userAfterSave.resetPasswordToken;
      const mailOptions = {
        to: user.email,
        from: process.env.FROM_EMAIL,
        subject: "Password change request",
        text: `Hi ${user.username} \nPlease click on the following link ${link} to reset your password.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };

      sgMail.send(mailOptions, (err, result) => {
        if (err) {
          return res.status(500).json({ message: error.message });
        }
        res
          .status(200)
          .json({ message: `A reset email has been sent to ${user.email}.` });
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// /**
//  * @route GET api/auth/reset
//  * @desc Reset Password - Validate password reset token and shows the password reset view
//  * @access Public
//  */
// passwordController.getResetView = async (req, res) => {
//   try {
//     const resetPasswordToken = req.params.token;
//     const user = await User.findOne({
//       resetPasswordToken: resetPasswordToken,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res
//         .status(401)
//         .json({ message: "Password reset token is invalid or has expired." });
//     }

//     // redirect user to form with the email address
//     res.render("reset", { user }); //! replace with react view here!
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

/**
 * @route POST api/auth/reset
 * @description Reset password
 * @access Public
 */
passwordController.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = req.params.token;
    const user = await User.findOne({
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Password reset token is invalid or has expired." });
    }

    // set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // save
    try {
      await user.save();

      // send email
      const mailOptions = {
        to: user.email,
        from: process.env.FROM_EMAIL,
        subject: "Your password has been changed",
        text: `Hi ${user.username} \nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
      };

      sgMail.send(mailOptions, (err, result) => {
        if (err) return res.status(500).json({ message: err.message });

        res.status(200).json({ message: "Your password has been updated." });
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = passwordController;
