/** @format */

const express = require("express");
const Category = require("../models/category");
const Product = require("../models/product");
const ejsHelpers = require("../helpers/productEJS");

const router = express.Router();

router.get("/all-products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: "desc" });
    res.json({
      error: false,
      product: products,
      categoryName: "All Products",
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

router.post("/rate/:id", async (req, res) => {
  try {
    //find just rated product
    let currentProduct = await Product.findOne({ _id: req.params.id });

    //current rated cutsomers
    let ratedCustomers = currentProduct.ratedCustomers;

    let reRatedCustomer;

    //check if customer has rated previously or not
    for (let i = 0; i < ratedCustomers.length; i++) {
      console.log("rated", ratedCustomers[i].id);
      console.log("new", req.body.ratedCustomerID);
      if (ratedCustomers[i].id === req.body.ratedCustomerID) {
        reRatedCustomer = ratedCustomers[i].id;
      }
    }

    let reRatedRating;

    //if reRated is true find the previously rated rating
    if (reRatedCustomer) {
      for (let i = 0; i < ratedCustomers.length; i++) {
        if (ratedCustomers[i].id === reRatedCustomer) {
          reRatedRating = ratedCustomers[i];
        }
      }
    }

    //rating to be submitted/updated with
    let newRatedCustomer = {
      id: req.body.ratedCustomerID,
      ratings: req.body.rating,
      review: req.body.review,
      createdAt: reRatedRating ? reRatedRating.createdAt : Date.now(),
    };

    //if reRated is true add the updatedAt time
    reRatedRating ? (newRatedCustomer.updatedAt = Date.now()) : null;

    //calculate the rating
    let ratings = [];

    //loop through all the previous ratings
    for (let i = 0; i < ratedCustomers.length; i++) {
      ratings.push(Number(ratedCustomers[i].ratings));
    }

    //find the average of all ratings
    function calculateRatingAverage(ratings) {
      let averageRating;
      averageRating = ratings.reduce((a, b) => a + b) / ratings.length;

      return averageRating;
    }

    async function updateDB(filter, update, message, responseData) {
      await Product.updateOne(filter, update);
      const responseObject = {
        error: false,
        message: message,
        data: responseData,
      };
      return responseObject;
    }

    if (reRatedCustomer) {
      // if rated previously run this

      //find the index of rerated rating
      const index = ratedCustomers.indexOf(reRatedRating);

      //if index is present update the old rating with new one
      if (index !== -1) {
        ratedCustomers[index] = newRatedCustomer;
      }

      //update the rating of previous rating object with new one
      ratings[index] = Number(req.body.rating);

      let finalRating = calculateRatingAverage(ratings);

      //query for the finding product from db
      const filter = {
        _id: req.params.id,
      };

      //objects to be updated
      const update = {
        ratedCustomers: ratedCustomers,
        ratings: finalRating,
      };

      let message = "Ratings has been updated succesfully!";

      //update the db with arg1 = filter query, arg2= data to be updated with, arg3= message and arg4 = response data to be sent
      const response = updateDB(filter, update, message, finalRating);

      //update the product
      res.json(response);
    } else {
      // if newly rated run this

      //add the new rating to the ratings array
      ratedCustomers.push(newRatedCustomer);

      //update the rating of previous rating object with new one
      ratings.push(Number(req.body.rating));

      let finalRating = calculateRatingAverage(ratings);

      //query for the finding product from db
      const filter = {
        _id: req.params.id,
      };

      //objects to be updated
      const update = {
        ratedCustomers: ratedCustomers,
        ratings: finalRating,
      };

      let message = "Ratings has been submitted succesfully!";

      //update the db with arg1 = filter query, arg2= data to be updated with, arg3= message and arg4 = response data to be sent
      const response = updateDB(filter, update, message, finalRating);

      //update the product
      res.json(response);
    }
  } catch (err) {
    console.error("Rating Err: ", err);
    res.sendStatus(500);
  }
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
