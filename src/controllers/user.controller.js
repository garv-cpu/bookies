import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const generateToken = (userID) => {
  return jwt.sign({ userID }, process.env.JWT_SECRET, {
    expiresIn: "16d",
  });
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be at least 6 characters long" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    if (username.length < 2) {
      return res
        .status(400)
        .json({ message: "Username should be at least 2 characters long" });
    }

    // Check if user already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail)
      return res.status(400).json({ message: "Email already exists" });

    const existingUsername = await User.findOne({ username });

    if (existingUsername)
      return res.status(400).json({ message: "Username already exists" });

    // Generate random avatar
    const profileImage = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${username}`;

    // Create the user
    const user = new User({
      username,
      email,
      password,
      profileImage,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be at least 6 characters long" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    // Check if user exists
    const userEmail = await User.findOne({ email });

    if (!userEmail) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Check if password is correct
    const isMatch = await userEmail.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Generate JWT token
    const token = generateToken(userEmail._id);

    res.status(200).json({
      token,
      user: {
        id: userEmail._id,
        username: userEmail.username,
        email: userEmail.email,
        profileImage: userEmail.profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
