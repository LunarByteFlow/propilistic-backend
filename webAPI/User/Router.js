const express = require("express");
const Router = express.Router();

// const { createUser, Logout, getUser, Login } = require("./Controller.js");
const { createUser, Logout, getUser, Login } = require("./Controller.js");

Router.post("/login", Login);
Router.post("/createUser", createUser);
Router.get("/getuser", getUser);



module.exports = Router;
