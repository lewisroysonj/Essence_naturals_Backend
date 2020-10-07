/** @format */

const User = require("../models/user");
const Order = require("../models/order");

const stripe = require("stripe")("sk_test_51HY93TDKKKjugUT604OIQ1zasqxfNu7oq4VrPsd9NrnwNGZZ3ZoQVCVQXYXbMs5ByVOh4w7DjbVERIRquqFLMtz000ty8ukAbl");

module.exports = {
  saveAddress: async function saveAddress(req, res, next) {
    try {
      const user = await User.findOne({
        _id: req.user.accessUser,
      });
      let userAddress = user.shippingAddress;
      userAddress = req.body.shippingInfo;
      await User.updateOne({ _id: req.user.accessUser }, { shippingAddress: userAddress });
      req.user.email = user.email;
      next();
    } catch (err) {
      console.error("Save Address Error :", err);
      res.status(500).send({
        error: true,
        message: "Something went wrong while saving the shipping Address!",
      });
    }
  },

  completePayment: async function completePayment(req, res, next) {
    const line_items = [];
    const totalPrice = [];

    for (let i = 0; i < req.body.items.length; i++) {
      let price = req.body.items[i].finalPrice * (10 / 100) * 100 + req.body.items[i].finalPrice * 100;
      totalPrice.push(price);
      const product = {
        price_data: {
          currency: "usd",
          product_data: {
            name: req.body.items[i].name,
            images: [req.body.items[i].featuredImage],
          },
          unit_amount: price,
        },
        quantity: req.body.items[i].qty ? req.body.items[i].qty : 1,
      };

      line_items.push(product);
    }

    try {
      if (line_items.length > 0) {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: [req.body.paymentMode],
          line_items: line_items,
          mode: "payment",
          success_url: `${process.env.CLIENT_DOMAIN}/checkout/status?success=true`,
          cancel_url: `${process.env.CLIENT_DOMAIN}/checkout/status?canceled=true`,
          client_reference_id: req.user.accessUser,
          customer_email: req.user.email,
          metadata: req.body.shippingInfo,
        });
        req.user.sessionID = session.id;
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
  },

  removeCartItems: async function removeCartItems(req, res, next) {
    try {
      await User.updateOne({ _id: req.user.accessUser }, { cartItems: [] });
      next();
    } catch (err) {
      console.error("Remove cart items Error: ", err);
      res.status(500).json({
        error: true,
        message: "Something went wrong!",
      });
    }
  },

  removeBuyNow: async function removeBuyNow(req, res, next) {
    try {
      const user = await User.findOne({ _id: req.user.accessUser });

      if (user.buynow.name) {
        await User.updateOne({ _id: req.user.accessUser }, { buynow: {} });
        next();
      } else {
        let error = "No items provided for checkout";
        throw error;
      }
    } catch (err) {
      console.error("Remove Buy now Error: ", err);
      res.status(500).json({
        error: true,
        message: "Something went wrong!",
      });
    }
  },
  saveOrder: async function saveOrder(req, res, next) {
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
      next();
    } catch (err) {
      console.error("Save order Error: ", err);
      res.status(500).json({
        error: true,
        message: "Something went wrong while saving order!",
      });
    }
  },
};
