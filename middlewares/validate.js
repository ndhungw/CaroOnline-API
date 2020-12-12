/**
 * This middleware is used to check if the express-validator middleware returns an error.
 *
 * If so, it recreates the error object using the param and msg keys and returns the error.
 */

const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let error = {};
    errors.array().map((err) => (error[err.param] = err.msg));
    return res.status(422).json({ error });
  }

  next();
};
