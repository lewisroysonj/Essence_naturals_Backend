/** @format */

const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const Product = require("../models/product");
const User = require("../models/user");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.accessUser });
    const cartItems = user.cartItems;
    res.json({
      error: false,
      cartItems: cartItems,
    });
  } catch (err) {
    console.error("Cart Err: ", err);
    res.status(500).send("Something went wrong!");
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.accessUser });
    console.log("user", user);
    const product = await Product.findOne({ _id: req.body.id });

    console.log("brooo", req.body);
    console.log("product", product);

    const cartItems = user.cartItems;

    const newCartItem = product;

    if (req.body.addItem) {
      cartItems.push(newCartItem);
      console.log("added one", cartItems);
      console.log("length", cartItems.length);
    } else {
      let i = cartItems.length;
      let index;
      while (i--) {
        if (cartItems[i] && cartItems[i].hasOwnProperty("name") && cartItems[i]._id.toString() === newCartItem._id.toString()) {
          index = i;
          console.log(index, "bro");
        }
      }
      console.log("index", index);
      if (index >= 0) {
        cartItems.splice(index, 1);
      }

      console.log("removed one", cartItems);
      console.log("length", cartItems.length);
    }

    await User.updateOne({ _id: req.user.accessUser }, { cartItems: cartItems });

    res.json({
      cartItems: cartItems,
      reqbody: req.body,
      error: false,
    });
  } catch (err) {
    console.error("New Category Err: ", err);
    res.status(500).json({ "error message": "Something went wrong while adding new Category" });
  }
});

module.exports = router;
