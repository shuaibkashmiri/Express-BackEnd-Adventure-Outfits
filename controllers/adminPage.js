const Product = require("../model/ProductModel");
const Order = require("../model/orderModel");
const User = require("../model/userModel");

const getAdminPage = async (req, res) => {
  try {
    const products = await Product.find();

    // console.log(products)

    const users = await User.find()
      .populate({
        path: "cart.productId",
        select: "name price",
      })
      .populate({
        path: "orders",
        select: "totalAmount",
      });

    const orders = await Order.find()
      .populate({
        path: "user",
      })
      .populate({
        path: "products.productId",
      });

    res.status(200).json({
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      products: products,
      users: users,
      orders: orders,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getAdminPage };
