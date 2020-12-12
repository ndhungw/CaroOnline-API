/**
 * The Passport JWT authentication strategy is created and configured.
 */

const passportJwt = require("passport-jwt"); // passport-jwt: a passport strategy for authenticating with a JSON Web Token
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const User = require("../../models/user-model");

const strategy = new JwtStrategy(
  jwtOptions,
  async function (jwt_payload, next) {
    console.log("payload received: ", jwt_payload);

    // a database call
    try {
      const user = await User.findById(jwt_payload.id);

      if (user) {
        // (error, user, info)
        next(null, user);
      } else {
        next(null, false);
      }
    } catch (err) {
      return next(err, false, { message: "Server error in getting this user" });
    }
  }
);

module.exports = strategy;
