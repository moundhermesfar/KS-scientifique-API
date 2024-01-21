const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      required: true,
    },
    img1: {
      data: Buffer,
      contentType: String,
    },
    img2: {
      data: Buffer,
      contentType: String,
    },
    img3: {
      data: Buffer,
      contentType: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("product", productSchema);
