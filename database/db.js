/** @format */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "../config/config.env" });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: true,
      useCreateIndex: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("DB Error: ", err);
    process.exit(1);
  }
};

module.exports = connectDB;
