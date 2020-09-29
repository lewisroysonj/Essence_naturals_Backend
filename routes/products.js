/** @format */

const express = require("express");
const Category = require("../models/category");
const Product = require("../models/product");
const ejsHelpers = require("../helpers/productEJS");
const category = require("../models/category");

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
  let categories = await Category.find({});
  const categoryList = categories.map((category) => {
    return {
      id: category._id,
      name: category.name,
      slug: category.slug,
    };
  });
  res.render("newProduct", { categoryList, ejsHelpers });
});

router.post("/add", async (req, res) => {
  try {
    let quantity = {
      value: req.body.amount,
      unit: req.body.units,
    };

    let options = { name: req.body.varietyName, EPIN: req.body.varietyEPIN };

    let tags = req.body.tags.split(/ , |, | ,|,/);

    let categoryName = await Category.findOne({ slug: req.body.categoryID });

    let product = req.body;
    product.quantity = quantity;
    product.options = options;
    product.tags = tags;
    product.categoryName = categoryName.name;

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

    const category = await Category.findOne({
      slug: req.params.category,
    });

    console.log(category);

    if (category === null) {
      res.status(404).json({ message: "Couldn't Find the Page you are looking for" });
    } else {
      res.json({
        error: false,
        product: products,
        categoryName: category.name,
      });
    }
  } catch (err) {
    console.error("Product Category Err: ", err);
    res.status(500).send("Something went wrong!");
  }
});

router.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
    });

    const products = await Product.find({
      _id: { $ne: req.params.id },
    });

    res.json({
      error: false,
      product: product,
      similarProducts: products,
    });
  } catch (err) {
    console.error("ProductData Err: ", err);
    res.status(500).send("Something went wrong!");
  }
});

module.exports = router;
