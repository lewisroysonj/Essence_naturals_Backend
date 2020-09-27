/** @format */

const express = require("express");
const connectDB = require("../database/db");
const Product = require("../models/product");
const listBuckets = require("../config/upload");
const uploadImage = require("../config/upload");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: "desc" });
    res.json({
      error: false,
      product: products,
    });
  } catch (err) {
    console.error("Product Err: ", err);
    res.status(500).send("Something went wrong!");
  }
});

router.get("/add", async (req, res) => {
  let product = new Product();
  res.render("newProduct");
});

router.post("/add", async (req, res) => {
  try {
    let quantity = {
      value: req.body.amount,
      unit: req.body.units,
    };

    let options = { name: req.body.varietyName, EPIN: req.body.varietyEPIN };

    let tags = req.body.tags.split(/ , |, | ,|,/);

    let product = req.body;
    product.quantity = quantity;
    product.options = options;
    product.tags = tags;

    const newProduct = new Product(product);
    await newProduct.save();
    res.json({
      product: newProduct,
      reqbody: req.body,
      error: false,
    });
  } catch (err) {
    console.error("New Product Err: ", err);
    res.status(500).json({ "error message": "Something went wrong while adding new product" });
  }
});

router.post("/addtest", (req, res) => {
  console.log(req.body);
  res.json(req.body);
});

router.get("/:category", async (req, res) => {
  try {
    const products = await Product.find({
      categoryID: req.params.category,
    });
    console.log(req.params.category);
    console.log(products);
    res.json({
      error: false,
      product: products,
    });
  } catch (err) {
    console.error("Product Err: ", err);
    res.status(500).send("Something went wrong!");
  }
});

router.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
    });
    res.json({
      error: false,
      product: product,
    });
  } catch (err) {
    console.error("ProductData Err: ", err);
    res.status(500).send("Something went wrong!");
  }
});

module.exports = router;
