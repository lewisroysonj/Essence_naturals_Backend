/** @format */

const express = require("express");
const Category = require("../models/category");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const category = await Category.find({});
    res.json({
      error: false,
      categories: category,
    });
  } catch (err) {
    console.error("Category Err: ", err);
    res.status(500).send("Something went wrong!");
  }
});

router.get("/add", async (req, res) => {
  let category = new Category();
  res.render("newCategory");
});

router.post("/add", async (req, res) => {
  try {
    let tags = req.body.tags.split(/ , |, | ,|,/);

    let category = req.body;
    category.tags = tags;

    const newCategory = new Category(category);
    await newCategory.save();
    res.json({
      category: newCategory,
      reqbody: req.body,
      error: false,
    });
  } catch (err) {
    console.error("New Category Err: ", err);
    res.status(500).json({ "error message": "Something went wrong while adding new Category" });
  }
});

module.exports = router;
