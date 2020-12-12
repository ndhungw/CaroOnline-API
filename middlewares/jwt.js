/**
 * The Passport JWT authentication strategy is created and configured.
 */

// an authentication middleware for Node.js
const passport = require("passport");

// passport-jwt: a passport strategy for authenticating with a JSON Web Token
const passportJwt = require("passport-jwt");
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

// model
const User = require("../models/user-model");

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  console.log("payload received: ", jwt_payload);

  // a database call
  try {
    const user = User.findById(jwt_payload.id);

    if (user) {
      // (error, user, info)
      next(null, user);
    } else {
      next(null, false);
    }
  } catch (err) {
    return next(err, false, { message: "Server error in getting this user" });
  }
});

// passport.use(strategy);

module.exports = strategy;

// module.exports = (passport) => {
//   passport.use(strategy);
// };
