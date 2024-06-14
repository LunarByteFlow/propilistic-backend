const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  Role: {
    type: String,
    required: true,
    default: "user",
  },
  ProfilePic: {
    type: String,
    default: "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png",
  },
  date: {
    type: String,
    default: Date.now,
  },
});
const User = model("User", UserSchema);

module.exports = User;
