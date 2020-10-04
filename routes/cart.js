/** @format */

const express = require("express");
const stripe = require("stripe")("sk_test_51HY93TDKKKjugUT604OIQ1zasqxfNu7oq4VrPsd9NrnwNGZZ3ZoQVCVQXYXbMs5ByVOh4w7DjbVERIRquqFLMtz000ty8ukAbl");
const { authenticateToken } = require("../middleware/auth");
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");

const router = express.Router();

function calculatePrice(products) {
  let prices = [];
  for (let i = 0; i < products.length; i++) {
    prices.push(Number(products[i].finalPrice));
  }

  let totalPrice = 0;
  for (let i in prices) {
    totalPrice += prices[i];
  }
  return totalPrice;
}

function groupBy(array, key) {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);

    return result;
  }, {});
}

function handleGroupedArray(groupedProducts) {
  const cartproductArray = [];
  let cartQuantity = [];
  let o = Object.keys(groupedProducts);
  for (let i = 0; i < o.length; i++) {
    groupedProducts[o[i]][0].qty = groupedProducts[o[i]].length;
    cartproductArray.push(groupedProducts[o[i]][0]);
    cartQuantity.push(groupedProducts[o[i]][0].qty);
  }
  console.log(cartQuantity);
  let totalQuantity = 0;
  for (let i in cartQuantity) {
    totalQuantity += cartQuantity[i];
  }
  return {
    cartproductArray,
    totalQuantity,
  };
}

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

async function saveAddress(req, res, next) {
  try {
    const user = await User.findOne({
      _id: req.user.accessUser,
    });
    let userAddress = user.shippingAddress;
    userAddress = req.body.shippingInfo;
    await User.updateOne({ _id: req.user.accessUser }, { shippingAddress: userAddress });
    console.log("Success");
    next();
  } catch (err) {
    console.error("Save Address Error :", err);
    res.status(500).send({
      error: true,
      message: "Something went wrong while saving the shipping Address!",
    });
  }
}

async function completePayment(req, res, next) {
  const line_items = [];

  for (let i = 0; i < req.body.items.length; i++) {
    let price = req.body.items[i].finalPrice * 100;
    const product = {
      price_data: {
        currency: "usd",
        product_data: {
          name: req.body.items[i].name,
          images: [req.body.items[i].featuredImage],
        },
        unit_amount: price,
      },
      quantity: req.body.items[i].qty,
    };

    line_items.push(product);
  }

  try {
    if (line_items.length > 0) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: [req.body.paymentMode],
        line_items: line_items,
        mode: "payment",
        success_url: `${process.env.CLIENT_DOMAIN}/checkout/?success=true`,
        cancel_url: `${process.env.CLIENT_DOMAIN}/checkout/?canceled=true`,
      });
      req.user.sessionID = session.id;
      console.log("session", req.user.sessionID);
      next();
    } else {
      res.status(500).json({
        error: true,
        message: "Something went wrong!",
      });
    }
  } catch (err) {
    console.error("Stripe Error: ", err);
    res.status(500).json({
      error: true,
      message: "Something went wrong!",
    });
  }
}

async function removeCartItems(req, res, next) {
  try {
    await User.updateOne({ _id: req.user.accessUser }, { cartItems: [] });
    console.log("Emptied cart successfully!");
    next();
  } catch (err) {
    console.error("Remove cart items Error: ", err);
    res.status(500).json({
      error: true,
      message: "Something went wrong!",
    });
  }
}

async function saveOrder(req, res, next) {
  try {
    const user = await User.findOne({
      _id: req.user.accessUser,
    });

    const userOrders = user.orders;

    const orderDetails = {
      items: req.body.items,
      buyerID: req.user.accessUser,
      buyerName: req.body.shippingInfo.firstName + " " + req.body.shippingInfo.lastName,
      shippingAddress: req.body.shippingInfo,
    };
    const newOrder = new Order(orderDetails);
    await newOrder.save();

    const newUserOrder = newOrder._id;

    userOrders.push(newUserOrder);

    await User.updateOne({ _id: req.user.accessUser }, { orders: userOrders });

    req.transactionID = newOrder.transactionID;

    console.log(newOrder);

    console.log("Order saved Successfully!");
    next();
  } catch (err) {
    console.error("Save order Error: ", err);
    res.status(500).json({
      error: true,
      message: "Something went wrong while saving order!",
    });
  }
}

router.post("/checkout/create-session", authenticateToken, saveAddress, completePayment, saveOrder, removeCartItems, async (req, res) => {
  res.json({
    id: req.user.sessionID,
    transactionID: req.transactionID,
  });
});

module.exports = router;
