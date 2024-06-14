import express from "express";
import User from "../models/User.js";
import { query, body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import fetchuser from "../middleware/fetchuser.js";
import imageDownloader from "image-downloader";
// import cookieParser from "cookie-parser";
import Cookies from "js-cookie";
//setting up salt and pepper security settings
import bcrypt from "bcryptjs";
// const genSalt = bcrypt.genSalt()
import bodyParser from "body-parser";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

import Places from "../models/Places.js";
// import multer from "multer";
import connect from "connect";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const auth = express.Router();

//Creating a string for JWT authentication.
const JWT_SECRET = "jbhjbhebfjkdnnbjknuejejnn";

// app.use('/uploads',express.static(__dirname + '/uploads'));
//ROUTE 1: create a user using : POST on api/auth/createUser .No login Required
auth.post(
  "/createUser",
  [
    body("email", "Enter a vald Email").isEmail(),
    // password must be at least 5 chars long
    body("password", "Enter a valid password").isLength({ min: 5 }),
    body("name", "Enter a valid name").isLength({ min: 5 }),
  ],

  async (req, res) => {
    let success = false;
    // if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    // Check weather the user with this email exists
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          success,
          error: "Sorry a user with this email already exists.",
        });
      }
      // Secret "pepper" value (keep this secret!)
      const pepper = "yourSecretPepperValue";
      // Adding salt and pepper to the password to make it secure .
      const salt = await bcrypt.genSalt(10);
      // Combine the password with the secret pepper
      const saltedAndPepperedPassword = req.body.password + pepper;
      // Hash the salted and peppered password
      const secPassword = await bcrypt.hash(saltedAndPepperedPassword, salt);

      //Create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPassword,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      // const token = createSecretToken(user._id);
      const authToken = jwt.sign(data, JWT_SECRET);
      res.cookie("authToken", authToken, {
        withCredentials: true,
        httpOnly: false,
      });
      success = true;
      res.json({ success, authToken });

      // const usermade = User(req.body);
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ success, error: "Internal Server Error" });
    }
  }
);

//ROUTE 2: Login The user with Email and password.
auth.post(
  "/login",
  [
    body("email", "Enter a vald Email").isEmail(),
    // password must exist for user to login
    body("password", "Enter a valid password").exists(),
  ],
  async (req, res) => {
    let success = false;
    // if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        res.status(404).json("Something went wrong");
      }
      const passwordCompare = bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        res.status(404).json({ success, error: "Something went wrong" });
      } else {
        const data = {
          user: {
            id: user.id,
          },
        };
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ success: true, authToken, user });
        res.cookie("authToken", authToken).json(user);
      }

      // Set the JWT as a cookie in the response
      success = true;
    } catch (error) {
      // console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE 3: Get the details of the logged In User.[/api/auth/getuser]
auth.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password"); // This will display every thing from the user object exept the password.
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//ROUTE 3: Get the details of the logged In User.[/api/auth/getuser]
auth.get("/getuser", (req, res) => {
  // res.json({ authToken });
  res.json("User Info");
});

//ROUTE 4: Get the details of the logged In User.[/api/auth/getuser]
auth.post("/logout", async (req, res) => {
  res.cookie("token", "").json(true);
});

auth.post("/upload-by-link", async (req, res) => {
  const { Link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  await imageDownloader.image({
    url: { Link },
    dest: __dirname + "/uploads" + newName,
  });
  console.log(Link);

  const options = {
    url: Link, // Provide the URL here
    dest: __dirname + "/uploads/" + newName,
  };

  res.json(__dirname + "/uploads/" + newName);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

auth.post("/places", upload.array("photos", 100), async (req, res) => {
  try {
    // Extract data from the request body
    const {
      title,
      description,
      perks,
      checkOut,
      address,
      checkIn,
      maxGuest,
      extraInfo,
    } = req.body;
    const photos = req.files ? req.files.map((file) => file.filename) : [];

    connect(process.env.MONGO_URL);

    // Create a new instance of the ProductAdd model
    const Place = new Places({
      title: title,
      description: description,
      perks: perks,
      address: address,
      checkOut: checkOut,
      checkIn: checkIn,
      maxGuest: maxGuest,
      extraInfo: extraInfo,
      photos: photos,
    });

    // Save the new product to the database
    await Place.save();

    // Respond with success
    res.status(201).json({ message: "Ad posted successfully!" });
  } catch (error) {
    console.error("Error posting ad:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to get all places
auth.get("/getAllplaces", async (req, res) => {
  try {
    const allPlaces = await Places.find();
    const placesWithPhotos = allPlaces.filter(
      (place) => place.photos && place.photos.length > 0
    );
    console.log("Places with photos:", placesWithPhotos);
    res.status(200).json(allPlaces);
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

auth.get("/getAdbyId/:_id", async (req, res) => {
  try {
    const { _id } = req.params;

    const placeDetails = await Places.findById(_id);

    if (!placeDetails) {
      return res.status(404).json({ message: "Ad not found" });
    }

    res.json(placeDetails);
  } catch (error) {
    console.error("Error fetching ad details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

auth.put("/UpdateAdbyId/:_id",async(req,res)=>{
  
})

export default auth;
