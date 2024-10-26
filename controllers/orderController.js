const Order = require("../model/orderModel");
const Product = require("../model/ProductModel");
const User = require("../model/userModel");
const { messageHandler } = require("../utils/utils");

const createCartOrder = async (req, res) => {
  try {
    const userId = req.user;

    const user = await User.findById(userId);

    if (!user || user.cart.length === 0) {
      return messageHandler(res,206,"Your Cart Is Empty")
        }

    let totalAmount = 0;
    const productsInCart = [];

    for (const cartItem of user.cart) {
      const product = cartItem.productId;

      if (!product) {
        return messageHandler(res,206,"Product Unavalaible")
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
      status: "pending",
    });

    const savedOrder = await newOrder.save();

    user.orders.push(savedOrder._id);

    user.cart = [];
    user.cartValue=0;

    await user.save();

    res.status(200).json({message:"Order Created SucessFully"})
  } catch (error) {
    console.error("Error creating order:", error);
  }
};

const deleteorder = async(req,res) =>{
    try{
      const id = req.params.orderId
      const delOrder = await Order.findByIdAndDelete(id)
      if(delOrder) {
        res.status(200).json({message:"Order Deleted"})
      }
    }
    catch(error){
      console.log(error)
    }


}


module.exports={createCartOrder}
