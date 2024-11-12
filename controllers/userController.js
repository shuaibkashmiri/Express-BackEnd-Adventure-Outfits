const bcrypt = require("bcrypt");
const User = require("../model/userModel");
const { messageHandler } = require("../utils/utils");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/nodeMailer");
const { config } = require("dotenv");
config("/.env");
const secretKey = process.env.SECRET_KEY;

const signUpHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (
      (!username || username === "") &&
      (!email || email === "") &&
      (!password || password === "")
    ) {
      return messageHandler(res, 306, "All Credentials Required");
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return messageHandler(res, 306, "User Already Registered");
    }
    const hashPass = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashPass,
    });
    if (newUser) {
      const baseUrl = "https://app-back-end-nm7b.onrender.com";
      const link = `${baseUrl}/verify/email/${newUser._id}`;
      const data = `Your account has been registered with Us ... kindly click on the below link    ${link} to actiavte your account  and confirm you Email`;

      const mail = await transporter.sendMail({
        from: "advicetechkmr@gmail.com",
        to: `${email}`,
        subject: `Welecome ${username}`,
        text: data,
      });

      if (newUser && mail) {
        return messageHandler(res, 201, "User Registered Sucessfully");
      }
    }
  } catch (error) {
    console.log("Something wrong with server");
  }
};

const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === "" || password === "") {
      return messageHandler(res, 203, "All credentails Required!");
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return messageHandler(res, 203, "No user Found");
    }

    const checkpass = await bcrypt.compare(password, existingUser.password);

    if (!checkpass) {
      return messageHandler(res, 203, "Password Incorrect");
    }

    const payload = existingUser._id;

    const token = await jwt.sign({ _id: payload }, secretKey);

    if (token) {
      res.cookie("token", token);
      res.status(200).json({ message: "user loggin success" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getUserDetails = async (req, res) => {
  try {
    const _id = req.user;
    if (_id) {
      const getUser = await User.findById(_id);
      messageHandler(res, 200, {
        msg: "User Fetched SucessFully",
        userdetails: getUser,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const handleDelete = async (req, res) => {
  try {
    const _id = req.user;
    console.log(_id);
    const checkUser = await User.findById(_id);
    if (checkUser) {
      await User.findByIdAndDelete(_id);
      messageHandler(res, 200, "User Deleted Sucessfully");
    } else {
      messageHandler(res, 200, "User not found");
    }
  } catch (error) {
    console.log(error);
  }
};

const handleEdit = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const _id = req.user;
    if (_id === "" || !_id) {
      messageHandler(res, 400, "no Id passed");
    }
    const findUser = await User.findById(_id);
    if (!findUser) {
      messageHandler(res, 404, "User Not Found");
    }
    const hashPass = await bcrypt.hash(password, 10);
    const editUser = await User.findByIdAndUpdate({
      username,
      email,
      password: hashPass,
    });
    if (editUser) {
      messageHandler(res, 201, "User Updated Sucessfully");
    } else {
      messageHandler(res, 200, "Some Error");
    }
  } catch (error) {
    console.log(error);
  }
};

//Verify User

const verifyEmail = async (req, res) => {
  try {
    const _id = req.params;
    const user = await User.findById(_id);
    if (user) {
      await User.findByIdAndUpdate(_id, {
        isEmailVerified: true,
      });
      res.render("index", { title: "Adventure Outfits | Verify" });
    }
  } catch (error) {
    console.log(error);
  }
};

const addressHandler = async (req, res) => {
  const { userId, orderId } = req.params;
  const {
    fullname,
    street,
    city,
    state,
    contact,
    postalCode,
    landMark,
  } = req.body;

  const credentials = {
    contact,
    fullname,
    street,
    landMark,
    city,
    state,
    postalCode,
  };

  const someEmpty = Object.values(credentials).some((value) => !value);
  if (someEmpty) {
    return res.status(206).json({ message: "All credentails required" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          addresses: [
            {
              fullname,
              street,
              city,
              state,
              contact,
              postalCode,
              landMark,
            },
          ],
        },
      },
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return messageHandler(res, 200, "some Error");
    }
    res.status(201).json({ message: "Proceeding to checkout", orderId });
  } catch (error) {
    console.log(error);
    res.render("cart", { message: "Some Error " });
  }
};

module.exports = {
  signUpHandler,
  loginHandler,
  getUserDetails,
  handleDelete,
  handleEdit,
  addressHandler,
};
