/** @format */

const express = require("express");
const { searchArticles } = require("../middleware/search");
const Product = require("../models/product");
const { search } = require("./products");

const router = express.Router();

router.get("/:data", searchArticles, (req, res, next) => {
  try {
    res.json({
      results: req.results,
      keyword: req.params.data,
    });
  } catch (err) {
    res.json(err);
    console.error("Search Err: ", err);
  }
});

module.exports = router;
