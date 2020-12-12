const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const passport = require("passport");

require("dotenv").config();
require("./database/database");

// ROUTES
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Initialize passport middleware
app.use(passport.initialize());
const jwtStrategy = require("./middlewares/jwt");
passport.use(jwtStrategy);

const authenticate = require("./middlewares/authenticate");

app.use("/", indexRouter);
app.use("/api/users", authenticate, usersRouter);
app.use("/api/auth", authRouter);

module.exports = app;
