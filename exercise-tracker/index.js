const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const models = require("./models");
const User = models.User;

require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose
  .connect(process.env["MONGO_URI"])
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  // Send the index.html file from the views directory
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  // Get username from the request body
  const username = req.body.username;

  // Check if the user already exists
  const existingUser = await User.findOne({ username: username });

  if (existingUser) {
    // Return the existing user's information
    res.json({
      username: username,
      _id: existingUser._id,
    });
  } else {
    // Create a new user
    const newUser = new User({
      username: username,
    });

    // Save the new user and return its information
    await newUser.save();
    res.json({
      username: username,
      _id: newUser._id,
    });
  }
});

app.post("/api/users/:userId/exercises", async (req, res) => {
  
  const userId = req.params.userId;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = req.body.date
    ? new Date(req.body.date).toDateString()
    : new Date().toDateString();

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.json({ error: "User not found" });
      return;
    }

    const exercise = {
      description,
      duration,
      date,
    };

    user.log.push(exercise);
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      date: date,
      duration: duration,
      description: description,
    });
  } catch (error) {
    
    console.error(error);
    res.json({ error: "Error saving exercise" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    const simplifiedUsers = users.map((user) => ({
      _id: user._id,
      username: user.username,
    }));
    res.json(simplifiedUsers);
  } catch (error) {
    console.error(error);
    res.json({ error: "Error fetching users" });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const id = req.params._id;
  const user = await User.findById(id);
  let log = user.log;
  const { from, to, limit } = req.query;

  if (from) {
    log = log.filter((exercise) => new Date(exercise.date) >= new Date(from));
  }

  if (to) {
    log = log.filter((exercise) => new Date(exercise.date) <= new Date(to));
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    _id: id,
    username: user.username,
    count: log.length,
    log: log,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

