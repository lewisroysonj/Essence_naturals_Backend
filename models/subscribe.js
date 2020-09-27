/** @format */

const mongoose = require("mongoose");

const subscribeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Subscribe", subscribeSchema);
