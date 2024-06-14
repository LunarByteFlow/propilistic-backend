const express = require("express");
const { GetAddById, GetAllPlaces, postAnAdd } = require("./Controller");

const Router = express.Router();

Router.get("/getAllplaces", GetAllPlaces);
Router.get("/getAdbyId/:_id", GetAddById);
Router.post("/places", postAnAdd);

module.exports = Router;
