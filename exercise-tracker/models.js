const mongoose = require("mongoose");

const exerciseSchema = mongoose.Schema({
  username: { type: String, required: false },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: false },
});

const userSchema = mongoose.Schema({
  username: { type: String, requried: true },
  log: { type: Array, required: false },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);
const User = mongoose.model("User", userSchema);

module.exports = { User, Exercise };

