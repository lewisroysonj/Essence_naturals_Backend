/** @format */

const Product = require("../models/product");

module.exports = {
  searchArticles: async function (req, res, next) {
    try {
      const searchResults = await Product.find({ $text: { $search: req.params.data } });
      req.results = searchResults;
      next();
    } catch (err) {
      console.error("Search Err: ", err);
    }
  },
};
