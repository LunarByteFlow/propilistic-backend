const express = require("express");
const { query, body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const fetchuser = require("../../middleware/fetchuser.js");
const imageDownloader = require("image-downloader");
// const cookieParser = require("cookie-parser");
const Cookies = require("js-cookie");
// const genSalt = bcrypt.genSalt()
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const multer = require("multer");
const { fileURLToPath } = require("url");
const { dirname } = require("path");
const path = require("path");
const connect = require("connect");
const dotenv = require("dotenv");
const Places = require("./PlaceModel.js");
const mongoose = require("mongoose");

// import multer from "multer";

dotenv.config();

const auth = express.Router();

GetAllPlaces = async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
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
};

const postAnAdd = async (req, res) => {
  try {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads/"); // Directory where files will be stored
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
      },
    });

    const upload = multer({ storage: storage }).array("photos", 100);

    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({ message: "File upload error" });
      } else if (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

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

      await Place.save();

      res.status(201).json({ message: "Ad posted successfully!" });
    });
  } catch (error) {
    console.error("Error posting ad:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Route to get all places
// auth.get("/getAllplaces", async (req, res) => {
//   try {
//     const allPlaces = await Places.find();
//     const placesWithPhotos = allPlaces.filter(
//       (place) => place.photos && place.photos.length > 0
//     );
//     console.log("Places with photos:", placesWithPhotos);
//     res.status(200).json(allPlaces);
//   } catch (error) {
//     console.error("Error fetching places:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });
GetAddById = async (req, res) => {
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
};
// auth.get("/getAdbyId/:_id", async (req, res) => {
//   try {
//     const { _id } = req.params;

//     const placeDetails = await Places.findById(_id);

//     if (!placeDetails) {
//       return res.status(404).json({ message: "Ad not found" });
//     }

//     res.json(placeDetails);
//   } catch (error) {
//     console.error("Error fetching ad details:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

auth.put("/UpdateAdbyId/:_id", async (req, res) => {});
module.exports = {
  GetAddById,
  GetAllPlaces,
  postAnAdd,
};
