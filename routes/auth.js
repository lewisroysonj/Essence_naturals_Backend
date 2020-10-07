/** @format */

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const { emailToLowerCase } = require("../middleware/auth");

const router = express.Router();

router.post("/register", emailToLowerCase, (req, res) => {
  try {
    User.findOne({ email: req.body.email }, async (err, doc) => {
      if (err) throw err;
      if (doc)
        res.status(206).json({
          error: true,
          message: "Email already exists!",
        });
      if (!doc) {
        try {
          const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
          const newUser = new User({
            fullName: req.body.fullName,
            email: req.body.email,
            password: hashedPassword,
          });

          await newUser.save();
          res.send({ error: false, message: "Signed Up successfully, Sign In with your account to continue", userEmail: req.body.email });
        } catch (err) {
          console.error("Register1 Err: ", err);
          res.status(500).json({ error: true, message: "Something went wrong!" });
        }
      }
    });
  } catch (err) {
    console.error("Register Err :", err);
    res.sendStatus(500);
  }
});

router.post("/login", emailToLowerCase, async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (user === null) {
    res.status(203).send({ error: true, message: "User not found" });
  } else {
    try {
      if (await bcrypt.compare(req.body.password, user.password)) {
        const accessUser = user._id;
        const accessToken = jwt.sign({ accessUser }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 604800 });
        res.json({ accessToken: accessToken, error: false, message: "signed in succesfully", user });
      } else res.send({ error: true, message: "Incorrect Password" });
    } catch (err) {
      res.status(500).json({
        error: true,
        message: err.message,
      });
      console.error("Login Err: ", err);
    }
  }
});

module.exports = router;
