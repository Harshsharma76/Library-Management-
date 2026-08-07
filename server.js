const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const multer = require("multer");
const path = require("path");

const routes = require("./routes");
const db = require("./config/db");
require("./utils/cron");

const app = express();
app.use(express.json());

app.use("/", routes);

async function startServer() {
  try {
    // await redisClient.connect();

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();
