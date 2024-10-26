const mongoose = require("mongoose");
const Product = require("./ProductModel");

const User = mongoose.model("User", {
  username: String,
  email: String,
  password: String,
  mobile:Number,
  fullname:String,
  street: String,
  village:String,
  landmark: String,
  city: String,
  state: String,
  pincode:Number,
  isEmailVerified: Boolean,
  cartValue: { type : Number},
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
      type: mongoose.Schema.Types.ObjectId, ref: 'Order'  // Reference to Order model
    }
  ]
});

module.exports = User;
