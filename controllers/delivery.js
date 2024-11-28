const User = require("../model/userModel");

const addDiliveryDetails = async (req, res) => {
  try {
    const userId = req.user;
    const {
      contact,
      fullname,
      street,
      landmark,
      village,
      city,
      state,
      pincode,
    } = req.body;

    // Ensure all required fields are present
    const credentials = {
      contact,
      fullname,
      street,
      landmark,
      village,
      city,
      state,
      pincode,
    };
    const someEmpty = Object.values(credentials).some((value) => !value);

    if (someEmpty) {
      return res.status(206).json({ message: "All credentials required" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Push the new address to the addresses array
    user.addresses.push(credentials);

    // Save the updated user document
    await user.save();

    // Return success response
    res.status(200).json({ message: "Delivery details updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addDiliveryDetails };
