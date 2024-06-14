const express = require("express");
const mongoose = require("mongoose");
const Cookies = require("js-cookie");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const multer = require("multer");
const { fileURLToPath } = require("url");
const { dirname } = require("path");
const path = require("path");
const User = require("./UserModel.js");
const { connect } = require("connect");
const dotenv = require("dotenv");
const { sign } = require("jsonwebtoken");
const { jwt } = require("jsonwebtoken");
// import multer from "multer";

dotenv.config();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

//Creating a string for JWT authentication.
const JWT_SECRET = "jbhjbhebfjkdnnbjknuejejnn";

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  // required fields k liye lagaya
  if (!name || !email || !password) {
    res.status(403).json({
      message: "Missing Required Field",
    });
  }
  try {
    // Check if a user with this email already exists
    await mongoose.connect(process.env.MONGO_URL);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    // Hash the password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    // Generate JWT token for authentication
    const authToken = sign(
      { name: newUser.name, email: newUser.email },
      JWT_SECRET
    );

    // Set the authToken in a cookie
    res.cookie("authToken", authToken, { httpOnly: true, maxAge: 3600000 }); // Max age 1 hour

    // Respond with success and authToken
    res.json({ success: true, authToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;

  // missing fields k liye
  if (!email || !password) {
    res.status(403).json({
      message: "Missing Required Field",
    });
  }

  // when we got every field
  else {
    try {
      await mongoose.connect(process.env.MONGO_URL);

      // email de kr user ki existance check krwa rahy checkuser main Database wala data ha
      const CheckUser = await User.findOne({ email });

      if (!CheckUser) {
        res.status(404).json({
          message: "User Doesn't Exist",
        });
      }

      // agar user exist krta hai toh:
      else {
        // passwords match krwa rahy db wala or user ka diya hua
        const decryptPassword = await bcrypt.compare(
          password,
          CheckUser.password
        );

        // agar email and password match hojata ha toh
        if (email == CheckUser.email && decryptPassword) {
          // userdata ka ek constant banaya and usmain sari cheezain dhal din from database
          const UserData = {
            name: CheckUser.name,
            _id: CheckUser._id,
            email: CheckUser.email,
            Role: CheckUser.Role,
          };

          // ab token ka contant banaya and userdata de diya sara and usko jwt se guzaar diya
          // and response main phir de diya token ab frontend pe yeh token decode hota rahega
          const authToken = sign(UserData, JWT_SECRET);
          res.json({ success: true, authToken });
          res.cookie("authToken", authToken).json(User);
          res.json({
             success: true, authToken ,
            message: "Successfully Logginned",
            authToken,
          });
        } else {
          console.log("Invalid credentials")
        }
      }
    } catch (error) {
      res.json({
        message: error.message,
      });
    }
  }
};

//ROUTE 3: Get the details of the logged In User.[/api/auth/getuser]
const getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password"); // This will display every thing from the user object exept the password.
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

//ROUTE 4: Get the details of the logged In User.[/api/auth/getuser]
const Logout = async (req, res) => {
  res.cookie("token", "").json(true);
};
// auth.post("/logout", async (req, res) => {
//     res.cookie("token", "").json(true);
//   });

module.exports = {
  createUser,
  Logout,
  getUser,
  Login,
};
