/** @format */

const express = require("express");
const cors = require("cors");
const path = require("path");

const dotenv = require("dotenv");

const morgan = require("morgan");

const bodyParser = require("body-parser");
const multer = require("multer");

const connectDB = require("./database/db");

const router = require("./routes/index");
const productRouter = require("./routes/products");

const app = express();

const PORT = process.env.PORT || 5000;

dotenv.config({ path: "./config/config.env" });

//database
connectDB();

//middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

if (process.env.NODE_ENV === "production") {
  app.use(
    cors({
      origin: process.env.CLIENT_PORT,
      credentials: true,
    })
  );
} else {
  app.use(
    cors({
      origin: process.env.CLIENT_DEV_PORT,
      credentials: true,
    })
  );
}

app.disable("x-powered-by");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const multerMid = multer({
  storage: multer.memoryStorage({}),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
app.use(multerMid.single("myFile"));

app.use(express.static(__dirname + "/public"));

app.set("views", path.join(__dirname, "public", "views"));
app.set("view engine", "ejs");
//routes
app.use("/", router);
app.use("/products", productRouter);

app.listen(PORT, console.log(`Server is running in http://localhost:${PORT}`));