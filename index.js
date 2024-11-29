const express = require("express");
const cors = require("cors");
const cookie = require("cookie-parser");
const connectDb = require("./utils/connectDb");
const {
  signUpHandler,
  loginHandler,
  getUserDetails,
  handleDelete,
  handleEdit,
  addressHandler,
} = require("./controllers/userController");
const verifyUser = require("./controllers/userVerification");

const { isAuthenticated, isAdmin } = require("./middlewares/auth");
const multmid = require("./middlewares/multer");
const {
  handleAddProducts,
  getProducts,
} = require("./controllers/productContoller");
const { config } = require("dotenv");
const verifyAdmin = require("./controllers/verifyAdmin");
const { handleCatagory, handleSubCatagory } = require("./controllers/feature");
const {
  addToCart,
  getCart,
  emptyCart,
  removeFromCart,
} = require("./controllers/cartHandler");
const {
  createCartOrder,
  orderAddAddress,
} = require("./controllers/orderController");
const { addDiliveryDetails } = require("./controllers/delivery");
const { getAdminPage } = require("./controllers/adminPage");
const {
  checkout,
  createIntent,
  paymentSuccess,
} = require("./controllers/payment");
config("/.env");
const port = process.env.PORT;
// const frontOrigin=process.env.ORIGIN;
const server = express();

//  MiddleWares
server.use(
  cors({
   // origin: "http://localhost:3000",
     origin:"https://adventure-outfits-shuaibkashmiris-projects.vercel.app",
    credentials: true,
  })
); /* Middle ware  (used to monitor incoming and outgoing data)*/
server.use(express.json());
server.use(cookie());

//get routes
server.get("/", (req, res) => {
  res.json({
    name: "Shoaib",
    email: "shoaib@gmail.com",
    status: "Server Running",
  });
});
// Token Verify Route for Frontend HOC
server.get("/token/verify", verifyUser);
//User Api Routes
server.post("/user/signUp", signUpHandler);
server.post("/user/login", loginHandler);
//User Api Routes Authenticated
server.get("/user/userdetails", isAuthenticated, getUserDetails);
server.put("/user/edit", isAuthenticated, handleEdit);
server.delete("/user/delete", isAuthenticated, handleDelete);
server.post("/user/address/:userId/:orderId", isAuthenticated, addressHandler);
server.put("/user/addDetails", isAuthenticated, addDiliveryDetails);
//Admin Routes
// admin route for front-End Verification
server.get("/user/isAdmin", isAuthenticated, verifyAdmin);
server.get("/admin/dashboard", isAuthenticated, isAdmin, getAdminPage);

// api roustes for Products

server.post(
  "/products/add",
  isAuthenticated,
  isAdmin,
  multmid,
  handleAddProducts
);
server.get("/products/getAll", getProducts);
//catagory
server.get("/products/men", (req, res) => {
  handleCatagory(req, res, "Men");
});
server.get("/products/women", (req, res) => {
  handleCatagory(req, res, "Women");
});
//Sub Catagory
server.get("/products/shoes", (req, res) =>
  handleSubCatagory(req, res, "Shoes")
);
server.get("/products/jackets", (req, res) =>
  handleSubCatagory(req, res, "Waterproof Jackets")
);
server.get("/products/tops", (req, res) => handleSubCatagory(req, res, "Top"));
server.get("/products/pants", (req, res) =>
  handleSubCatagory(req, res, "Pant")
);
server.get("/products/accessories", (req, res) =>
  handleSubCatagory(req, res, "Accessories")
);

// Cart Routes

server.post("/products/addtocart/:productId", isAuthenticated, addToCart);
server.get("/products/getcart", isAuthenticated, getCart);
server.get("/products/removeItem/:productId", isAuthenticated, removeFromCart);
server.get("/produts/emptycart", isAuthenticated, emptyCart);

// Order Routes

server.post("/createOrder", isAuthenticated, createCartOrder);
server.get("/order/addAddress/:orderId", isAuthenticated, orderAddAddress);
server.get("/order/checkout/:orderId", isAuthenticated, checkout);
server.post("/order/paymentIntent", isAuthenticated, createIntent); //api for payment intent
server.get("/order/payment/success/:orderId", isAuthenticated, paymentSuccess);

server.listen(port, () => {
  console.log(`Server is listening on port ${port} `);
});

connectDb();
