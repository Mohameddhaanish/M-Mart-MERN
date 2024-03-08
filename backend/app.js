const express = require("express");
const app = express();
const errorMiddleware = require("./middlewares/error");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

//Global initialisation
dotenv.config({ path: path.join(__dirname, "config/config.env") });
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Handling routes
const products = require("./routes/products");
const auth = require("./routes/auth");

app.use("/api/v1/", products);
app.use("/api/v1/", auth);

//Testing route
app.get("/", (req, res) => {
  res.send("Running successfully");
});
//Handling errors
app.use(errorMiddleware);

module.exports = app;
