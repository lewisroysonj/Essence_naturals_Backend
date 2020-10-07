/** @format */

const mongoose = require("mongoose");
const slugify = require("slugify");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const dompurify = createDomPurify(new JSDOM().window);

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  featuredImage: {
    type: String,
    required: true,
  },
  images: {
    type: Array,
    required: true,
  },
  categoryID: {
    type: String,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  finalPrice: {
    type: Number,
    required: true,
  },
  MRP: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Object,
    default: {
      value: 1,
      unit: "no.",
    },
  },
  options: {
    type: Array,
    default: null,
  },
  description: {
    type: Array,
    required: true,
  },
  featured: {
    type: Boolean,
    required: true,
  },
  tags: {
    type: Array,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ratedCustomers: {
    type: Array,
    default: [],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  EPIN: {
    type: String,
    required: true,
    unique: true,
  },
});

productSchema.pre("validate", function (next) {
  try {
    if (this.name) {
      this.slug = slugify(this.name, { lower: true, strict: true });
    }

    let name = this.slug;
    const nameArray = name.split("-");
    const nameLetters = nameArray.map((names) => {
      return names.charAt(0);
    });

    this.EPIN = nameLetters.join("").toUpperCase() + Date.now();

    next();
  } catch (error) {
    console.error("Product Slug Error: ", error);
  }
});

module.exports = mongoose.model("Product", productSchema);
