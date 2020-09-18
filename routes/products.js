/** @format */

const express = require("express");
const connectDB = require("../database/db");
const Product = require("../models/product");

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
    let product = req.body;
    const newProduct = new Product(product);
    await newProduct.save();
    res.json({
      product: newProduct,
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

module.exports = router;
