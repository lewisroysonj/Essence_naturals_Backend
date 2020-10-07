/** @format */

const express = require("express");

const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");

const { formatDate } = require("../helpers/date");
const { authenticateToken } = require("../middleware/auth");
const { calculatePrice, groupBy, handleGroupedArray } = require("../helpers/orders");
const { saveAddress, completePayment, removeBuyNow, removeCartItems, saveOrder } = require("../middleware/checkout");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.accessUser });
    const cartItems = user.cartItems;
    const totalPrice = calculatePrice(cartItems);
    const groupedProducts = groupBy(cartItems, "name");
    const finalProducts = handleGroupedArray(groupedProducts);

    res.json({
      error: false,
      cartItems: finalProducts.cartproductArray,
      cartTotal: totalPrice,
      cartQuantity: finalProducts.totalQuantity,
    });
  } catch (err) {
    console.error("Cart Err: ", err);
    res.status(500).send("Something went wrong!");
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.accessUser });
    const product = await Product.findOne({ _id: req.body.id });

    const cartItems = user.cartItems;

    const newCartItem = product;

    if (req.body.addItem) {
      cartItems.push(newCartItem);
    } else {
      let i = cartItems.length;
      let index;
      while (i--) {
        if (cartItems[i] && cartItems[i].hasOwnProperty("name") && cartItems[i]._id.toString() === newCartItem._id.toString()) {
          index = i;
        }
      }
      if (index >= 0) {
        cartItems.splice(index, 1);
      }
    }

    const totalPrice = calculatePrice(cartItems);
    const groupedProducts = groupBy(cartItems, "name");
    const finalProducts = handleGroupedArray(groupedProducts);

    await User.updateOne({ _id: req.user.accessUser }, { cartItems: cartItems });

    res.json({
      cartItems: finalProducts.cartproductArray,
      cartTotal: totalPrice,
      cartQuantity: finalProducts.totalQuantity,
      error: false,
    });
  } catch (err) {
    console.error("New Category Err: ", err);
    res.status(500).json({ "error message": "Something went wrong while adding new Category" });
  }
});

router.post("/buynow", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.body.id });

    await User.updateOne({ _id: req.user.accessUser }, { buynow: product });

    res.json({
      error: false,
      product: product,
    });
  } catch (err) {
    console.error("Buy now Error :", err);
  }
});

router.get("/checkout", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.accessUser });
    const cartItems = user.cartItems;
    const totalPrice = calculatePrice(cartItems);
    const taxPercent = 10;
    const shipping = 0;
    const taxes = (totalPrice * taxPercent) / 100;
    const summary = {
      items: totalPrice,
      shipping: 0,
      taxes: taxes,
      total: totalPrice + taxes + shipping,
    };

    const groupedProducts = groupBy(cartItems, "name");
    const finalProducts = handleGroupedArray(groupedProducts);
    res.json({
      error: false,
      items: finalProducts.cartproductArray,
      summary: summary,
    });
  } catch (err) {
    console.error("Checkout Err: ", err);
    res.status(500).send("Something went wrong!");
  }
});

router.post("/checkout/create-session", authenticateToken, saveAddress, completePayment, async (req, res) => {
  res.json({
    id: req.user.sessionID,
  });
});

router.post("/checkout/placeorder", authenticateToken, saveOrder, removeCartItems, async (req, res) => {
  let date = new Date();
  date.setDate(date.getDate() + 18);

  let newDate = formatDate(date);

  res.json({
    transactionID: req.transactionID,
    error: false,
    message: "Order Placed Successfully!",
    deliveryDate: newDate,
  });
});

router.get("/checkout/removebuynow", authenticateToken, removeBuyNow, async (req, res) => {
  res.json({
    error: false,
    message: "removed items successfully",
  });
});

module.exports = router;
