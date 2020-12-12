const { restart } = require("nodemon");
const User = require("../models/user-model");

/**
 * @route GET api/users
 * @description Returns all users
 * @access Public
 */
exports.getAll = async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
};

/**
 * @route PUT api/users
 * @description Add a new user
 * @access Public
 */
exports.add = async (req, res) => {
  const { email } = req.body;
  try {
    // make sure this account doesn't already exist
    const user = await User.findOne({ email });

    if (user)
      return res.status(401).json({
        message:
          "The email address you entered is already associated with another account. You can change this users role instead.",
      });

    const newUserToAdd = new User(req.body);
    const newUser = await newUserToAdd.save();

    res
      .status(200)
      .json({ message: "Add new user successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route GET api/users/{id}
 * @description Get a specific user
 * @access Public
 */
exports.get = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route PUT api/users/{id}
 * @description Update user details
 * @access Public
 */
exports.update = async (req, res) => {
  try {
    const update = req.body;
    const id = rerq.params.id;
    const userId = req.user._id;

    // Make sure the passed id is that of the logged in user
    if (userId.toString() !== id.toString()) {
      return res.status(401).json({
        message: "You do not have the permission to update this data",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "User has been updated", user: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route DELETE api/users/{id}
 * @description Delete user
 * @access Public
 */
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user._id;

    // make sure the passed id is that of the logged in user
    if (userId.toString() !== id.toString()) {
      return res.status(401).json({
        message: "You do not have the permission to delete this data.",
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "User has been deleted.", deletedUser: deletedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};