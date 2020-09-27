/** @format */

const express = require("express");

const Contact = require("../models/contact.js");

const { emailToLowerCase } = require("../middleware/auth");

const router = express.Router();

router.post("/", emailToLowerCase, async (req, res, next) => {
  let contact = {
    fullName: req.body.fullName,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message,
  };

  const newContact = new Contact({
    ...contact,
  });

  newContact
    .save()
    .then(() => {
      res.send("Your query has been submitted, we will get back to you soon");
    })
    .catch((err) => {
      console.error("Contact Submission Err :", err);
      res.status(500).send("Something went wrong");
    });
});

module.exports = router;
