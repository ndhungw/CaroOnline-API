const User = require("../models/user-model");
const authController = {};
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");

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

authController.loginWithGoogle = async (req, res) => {
  const tokenId = req.body.tokenId;
  console.log("tokenId", tokenId);
  const client = new OAuth2Client(process.env.GOOGLE_APIS);

  try {
    const result = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_APIS,
    });

    if (result.payload.email_verified) {
      const newName = "gg_" + result.payload.email.split("@")[0];
      const checkUser = await User.findOne({ username: newName });

      if (checkUser) {
        // exist in database
        // const user2 = { id: checkUser._id };
        // const accessToken = await jwt.sign(user2, process.env.JWT_SECRET);
        const accessToken = await checkUser.generateJWT();

        res.json({
          token: accessToken,
          user: checkUser,
        });
      } else {
        const newUser = new User({
          username: newName,
          password: "123456",
          firstName: result.payload.given_name,
          lastName: result.payload.family_name,
          email: result.payload.email,
          // isLocalLogin: false,
          active: true,
        });

        const userRespond = await newUser.save();
        // const user2 = { id: userRespond._id };
        const accessToken = await userRespond.generateJWT();
        res.json({
          token: accessToken,
          user: userRespond,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

authController.loginWithFacebook = async (req, res) => {
  const data = req.body;
  const urlGraphFacebook =
    "https://graph.facebook.com/v2.11/" +
    data.userID +
    "/?fields=id,name,email&access_token=" +
    data.token;

  try {
    const respond = await fetch(urlGraphFacebook, {
      method: "GET",
    });

    const result = await respond.json();
    console.log("result", result);

    //-------

    const newUsername = "fb_" + result.email.split("@")[0];
    const checkUser = await User.findOne({ username: newUsername });

    if (checkUser) {
      // const user2 = { id: checkUser._id };
      // const accessToken = await jwt.sign(user2, process.env.ACCESS_TOKEN_KEY);
      const accessToken = await checkUser.generateJWT();
      res.json({
        token: accessToken,
        user: checkUser,
      });
    } else {
      const name = result.name.split(" ");
      const lName = name[name.length - 1];
      name.splice(name.length - 1, 1);
      const fName = name.join(" ");

      const newUser = new User({
        username: newUsername,
        password: "123456",
        firstName: fName,
        lastName: lName,
        email: "facebook:" + result.email,
        // isLocalLogin: false,
        active: true,
      });
      // const userRespond = await newUser.save();
      // const user2 = { id: userRespond._id };
      // const accessToken = await jwt.sign(user2, process.env.ACCESS_TOKEN_KEY);
      // res.json({
      //   accessToken: accessToken,
      //   id: userRespond._id,
      //   username: userRespond.username,
      // });
      const userRespond = await newUser.save();
      const accessToken = await userRespond.generateJWT();
      res.json({
        token: accessToken,
        user: userRespond,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = authController;
