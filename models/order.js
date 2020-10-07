/** @format */

const mongoose = require("mongoose");
const slugify = require("slugify");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const dompurify = createDomPurify(new JSDOM().window);

const orderSchema = new mongoose.Schema({
  items: {
    type: Array,
    required: true,
  },
  transactionID: {
    type: String,
    required: true,
    unique: true,
  },
  buyerName: {
    type: String,
    required: true,
  },
  buyerID: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  shippingAddress: {
    type: Object,
    required: true,
  },
});

orderSchema.pre("validate", function (next) {
  try {
    const buyerName = this.buyerName;
    const nameArray = buyerName.split(" ");
    const nameLetters = nameArray.map((name) => {
      return name.charAt(0);
    });
    this.transactionID = "EN" + nameLetters.join("").toUpperCase() + Date.now();

    next();
  } catch (err) {
    console.error("Order Slug Error: ", err);
  }
});

module.exports = mongoose.model("Order", orderSchema);
