/**
 * This middleware is used to authenticate the users request.
 * Using passport.authenticate() and specifying the 'jwt' strategy,
 * the request is authenticated by checking for the standard Authorization header
 * and verifying the verification token, if any.
 *
 * If unable to authenticate request, an error message is returned.
 */

const passport = require("passport");

module.exports = (req, res, next) => {
  passport.authenticate("jwt", function (err, user, info) {
    if (err) return next(err);

    if (!user)
      return res
        .status(401)
        .json({ message: "Unauthorized Access - No Token Provided!" });

    req.user = user;

    next();
  })(req, res, next);
};
