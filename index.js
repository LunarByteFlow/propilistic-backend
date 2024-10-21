const express = require("express");
// const auth = require("./routes/auth.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { fileURLToPath } = require("url");
const { dirname } = require("path");
const { appendFile } = require("fs");
const bodyParser = require("body-parser");
const process = require("process");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config()
// const connectToMongo = require("./db.js");
// const placeRouter = require("./webAPI/Place/Router.js");
// const router = require("./webAPI/User/Router.js");

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// connectToMongo();
const app = express();
const port = process.env.PORT || 8000;
app.use(express.json()); // For sending our json request to the server.
app.use(express.json());
app.use(cookieParser());
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello World Express!");
});
app.use("/uploads", express.static(__dirname + "/uploads"));
// app.use("/api/auth", auth);

app.get("/contact", (req, res) => {
  res.send("Hello World Express!");
});
app.use("/api", require("./webAPI/Place/Router")); //Category Line k liye krungi
app.use("/api", require("./webAPI/User/Router")); //login register k liye

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
