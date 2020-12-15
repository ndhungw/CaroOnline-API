/**
 * pre-save hook
 * used to hash the user's password using the bcrypt package
 * whenever a user is created or their password is changed before saving in the database.
 *
 * comparePassword method
 * used to compare the password entered by the user during login to the user's password currently in the database.
 *
 * generateJWT method
 * used for creating the authentication tokens using the jwt package.
 * This token will be returned to the user and will be required for accessing protected routes.
 *
 * The token payload includes the user's first name, last name, username and email address and is set to expire 60 days in the future.
 *
 * generatePasswordReset method
 * used to generate a password reset token using the Node.js crypto module and and calculates an expiry time (1 hour),
 * the user object is updated with this data.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: "Your email is required",
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      required: "Your username is required",
    },
    password: {
      type: String,
      unique: true,
      required: "Your password is required",
    },
    firstName: {
      type: String,
      required: "First Name is required",
      max: 100,
    },
    lastName: {
      type: String,
      required: "Last Name is required",
      max: 100,
    },
    profileImage: {
      type: String,
      required: false,
      max: 255,
    },
    resetPasswordToken: {
      type: String,
      require: false,
    },
    resetPasswordExpires: {
      type: Date,
      require: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  // auto-gen a salt and hash
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) return next(err);

    user.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  let payload = {
    id: this._id,
    email: this.email,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: parseInt(expirationDate.getTime() / 1000, 10),
  });

  return token;
};

// do not use the arrow function notation, it will change what 'this' is referring to,
// so it not pointing the user document anymore.
UserSchema.methods.generatePasswordReset = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // expires in an hour
};

mongoose.set("useFindAndModify", false);
const User = mongoose.model("Users", UserSchema);

module.exports = User;
