const jwt = require("jsonwebtoken");
const { messageHandler } = require("../utils/utils");
const { config } = require("dotenv");
const User = require("../model/userModel");
config("/.env");

const isAuthenticated = (req, res, next) => {
  try {
    const { token } = req.cookies;
    const secretKey = process.env.SECRET_KEY;
    jwt.verify(token, secretKey, (error, decode) => {
      if (error) {
        messageHandler(res, 401, "Unauthorised");
      } else {
        req.user = decode._id;
        return next();
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const id = req.user;
    const userEmail = process.env.ADMIN_EMAIL;
    const findAdmin = await User.findById(id);
    if (findAdmin.email !== userEmail) {
      return messageHandler(res, 206, "UnAuthorised");
    }
    return next();
  } catch (error) {
    console.log(error);
  }
};
module.exports = { isAuthenticated, isAdmin };
