/** @format */

const mongoose = require("mongoose");
const slugify = require("slugify");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const dompurify = createDomPurify(new JSDOM().window);

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  categoryImage: {
    type: String,
    required: true,
  },
  categoryID: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
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
  slug: {
    type: String,
    required: true,
    unique: true,
  },
});

categorySchema.pre("validate", function (next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  let name = this.slug;
  const nameArray = name.split("-");
  const nameLetters = nameArray.map((names) => {
    return names.charAt(0);
  });
  this.categoryID = nameLetters.join("").toUpperCase() + Date.now();

  next();
});

module.exports = mongoose.model("Category", categorySchema);
