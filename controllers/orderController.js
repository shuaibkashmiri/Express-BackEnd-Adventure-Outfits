const Order = require("../model/orderModel");
const Product = require("../model/ProductModel");
const User = require("../model/userModel");
const { messageHandler } = require("../utils/utils");

const createCartOrder = async (req, res) => {
  try {
    const userId = req.user;

    const user = await User.findById(userId);

    if (!user || user.cart.length === 0) {
      return messageHandler(res, 206, "Your Cart Is Empty");
    }

    let totalAmount = 0;
    const productsInCart = [];
    const address = user.addresses[0];

    for (const cartItem of user.cart) {
      const product = cartItem.productId;

      if (!product) {
        return messageHandler(res, 206, "Product Unavalaible");
      }

      const itemTotal = cartItem.price * cartItem.quantity;

      totalAmount += itemTotal;

      productsInCart.push({
        productId: product._id,
        quantity: cartItem.quantity,
        price: cartItem.price,
        color: cartItem.color,
        size: cartItem.size,
      });
    }

    const newOrder = new Order({
      user: userId,
      products: productsInCart,
      totalAmount: totalAmount,
      address: address,
      status: "pending",
    });

    const savedOrder = await newOrder.save();

    user.orders.push(savedOrder._id);

    user.cart = [];
    user.cartValue = 0;

    await user.save();

    res.status(200).json({ message: "Order Created SucessFully" });
  } catch (error) {
    console.error("Error creating order:", error);
  }
};

// admin controller
const deleteorder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user;

    const delOrder = await Order.findByIdAndDelete(orderId);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { orders: orderId } },
      { new: true }
    );

    if (delOrder && updatedUser) {
      return messageHandler(res, 200, "Order Deleted");
    }
  } catch (error) {
    console.log(error);
  }
};

//Admin changes Status of order
const changeOrderStatus = async (req, res) => {
  try {
    const { orderId, userId } = req.params;
    const { status } = req.body;

    // Ensure the 'status' is a string
    if (typeof status !== "string") {
      return res
        .status(400)
        .send("Invalid status value. Status should be a string.");
    }

    // Step 1: Update the order status in the Order model
    const updateOrder = await Order.findByIdAndUpdate(
      orderId, // Find the order by its ID
      { status: status }, // Set the new status
      { new: true } // Return the updated document
    );

    if (!updateOrder) {
      return res.status(404).send("Order not found");
    }

    // Step 2: Update the user's order reference status
    const updateUser = await User.findById(userId);

    if (!updateUser) {
      return res.status(404).send("User not found");
    }

    // Find the order in the user's orders array and update its status
    const orderIndex = updateUser.orders.findIndex(
      (order) => order.toString() === orderId
    );

    if (orderIndex !== -1) {
      // Update the status of the found order
      updateUser.orders[orderIndex].status = status;

      // Save the updated user document
      await updateUser.save();
    } else {
      return res.status(404).send("Order not found in user's orders");
    }

    // Step 3: Send a success message
    return messageHandler(res, 201, "Order Status Updated");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};

// confirm order  with updated addresss
const orderAddAddress = async (req, res) => {
  const { orderId } = req.params;
  try {
    const _id = req.user;
    const user = await User.findById(_id);
    const address = user.addresses[0];

    if (!address || address === undefined) {
      return messageHandler(res, 200, "Kindly Add Address");
    }

    const updateOrder = await Order.findByIdAndUpdate(orderId, {
      $set: { address: [address[0]] },
    });

    if (updateOrder) {
      return messageHandler(res, 201, "Order Updated");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createCartOrder,
  deleteorder,
  orderAddAddress,
  changeOrderStatus,
};
