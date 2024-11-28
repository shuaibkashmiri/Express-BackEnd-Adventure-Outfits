const mongoose = require("mongoose");
const Product = require("./ProductModel");

const User = mongoose.model("User", {
  username: String,
  email: String,
  password: String,
  addresses: [
    {
      fullname: String,
      street: String,
      city: String,
      state: String,
      contact: String,
      pincode: String,
      landmark: String,
      village: String,
    },
  ],
  isEmailVerified: Boolean,
  cartValue: { type: Number },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number },
      price: { type: Number },
      size: { type: String },
      color: { type: String },
    },
  ],

  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", // Reference to Order model
    },
  ],
});

module.exports = User;
