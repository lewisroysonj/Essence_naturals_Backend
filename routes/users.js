/** @format */

const express = require("express");

const User = require("../models/user");
const Subscribe = require("../models/subscribe");

const { authenticateToken, emailToLowerCase } = require("../middleware/auth");

const router = express.Router();

router.post("/subscribe", (req, res) => {
  Subscribe.findOne({ email: req.body.email }, async (err, doc) => {
    try {
      if (err) {
        console.error("Subscribe Err :", err);
        res.send(err);
      }
      if (doc)
        res.send({
          newUser: false,
          status: "You have already subscribed!",
          success: false,
        });
      if (!doc) {
        const newSubscriber = new Subscribe({
          email: req.body.email,
        });
        await newSubscriber.save();
        res.send({
          newUser: true,
          status: "Subscribed Successfully",
          success: true,
        });
      }
    } catch (err) {
      console.error("Subscribe Err: ", err);
      res.send(err);
    }
  });
});

router.get("/user", authenticateToken, async (req, res) => {
  if (req.user) {
    const user = await User.findOne({ _id: req.user.accessUser });

    console.log(user);

    try {
      if (user) {
        res.send({
          user,
        });
      } else {
        res.status(404).send("User not found!");
      }
    } catch (err) {
      console.error("Get User from ID Err :", err);
      res.sendStatus(500);
    }
  } else {
    res.status(204).json({ message: "unauthorized" });
  }
});

module.exports = router;
