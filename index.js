/** @format */

const express = require("express");
const cors = require("cors");
const path = require("path");

const stripe = require("stripe")("sk_test_51HY93TDKKKjugUT604OIQ1zasqxfNu7oq4VrPsd9NrnwNGZZ3ZoQVCVQXYXbMs5ByVOh4w7DjbVERIRquqFLMtz000ty8ukAbl");

const dotenv = require("dotenv");

const morgan = require("morgan");

const bodyParser = require("body-parser");
const multer = require("multer");

const connectDB = require("./database/db");

const router = require("./routes/index");
const productRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/users");
const contactRouter = require("./routes/contact");
const categoryRouter = require("./routes/categories");
const searchRouter = require("./routes/search");
const cartRouter = require("./routes/cart");

const app = express();

const PORT = process.env.PORT || 5000;

const CLIENT_DOMAIN = "http://localhost:3000/checkout";

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
app.use("/category", categoryRouter);
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/contact", contactRouter);
app.use("/search", searchRouter);
app.use("/cart", cartRouter);

app.post("/create-session", async (req, res) => {
  console.log(req);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Stubborn Attachments",
            images: ["https://i.imgur.com/EHyR2nP.png"],
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${CLIENT_DOMAIN}?success=true`,
    cancel_url: `${CLIENT_DOMAIN}?canceled=true`,
  });

  res.json({ id: session.id });
});

app.listen(PORT, console.log(`Server is running in http://localhost:${PORT}`));
