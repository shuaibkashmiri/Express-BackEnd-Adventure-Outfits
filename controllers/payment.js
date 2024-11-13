const Order = require("../model/orderModel");
const User = require("../model/userModel");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET);

const checkout = async (req, res) => {
  try {
    const userId = req.user;
    const { orderId } = req.params;

    const user = await User.findById(userId);

    const order = await Order.findById(orderId).populate({
      path: "products.productId",
    });

    let address = {};
    let card = {};

    if (user.addresses) {
      address = user.addresses[0];
    }

    if (user.cards) {
      card = user.cards[0];
    }

    return res.json({
      userId: req.user._id,
      username: req.user.username,
      cart: req.user.cart,
      order,
      user,
      address,
      card,
    });
  } catch (error) {
    console.error(error);
    res.render("cart", { message: "An error occurred during checkout." });
  }
};

// const paymentHandler = async (req, res) => {
//   const { order, totalAmount } = req.body;
//   const lineItems = order.products.map((product) => ({
//     price_data: {
//       currency: "usd",
//       product_data: {
//         name: product.name,
//         images: [product.imageUrl],
//       },
//       unit_amount: totalAmount * 100,
//       quantity: product.quantity,
//     },
//   }));

//   const session = await stripe.checkou.sessions.create({
//     payment_method_types: ["card"],
//     line_items: lineItems,
//     mode: "payment",
//   });
// };

//api
const createIntent = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Stripe accepts the amount in cents
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
};

const paymentSuccess = async (req, res) => {
  try {
    const userId = req.user;
    const { orderId } = req.params;

    const user = await User.findById(userId);
    user.cart = [];
    user.cartValue = 0;
    const updateUser = await user.save();
    const updateOrder = await Order.findByIdAndUpdate(
      orderId,
      { isPaymentDone: true },
      { new: true }
    );

    if (updateOrder && updateUser) {
      return res.json({
        userId: req.user._id,
        username: req.user.username,
        cart: req.user.cart,
        message: "Payment successful! Your order has been placed.",
      });
    }
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.json({
      message: "An error occurred while processing your payment",
    });
  }
};

module.exports = { checkout, createIntent, paymentSuccess };
