const express = require("express");
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validate");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// -- 🔐 AUTHENTICATION ROUTER
// - POST /signup      → Register new user
// - POST /login       → Login user (JWT / cookie)
// - POST /logout      → Logout user (clear cookie)

authRouter.post("/signup", async (req, res) => {
  try {
    // Validate user data
    validateSignupData(req);

    // Check if user exists
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Password hashing
    const passwordHashed = await bcrypt.hash(password, 10);

    // Create user and save to DB
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHashed,
    });

    const savedUser = await newUser.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // REQUIRED for HTTPS
      sameSite: "None",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      message: "User signed up successfully",
      user: {
        _id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        photo: savedUser.photo,
        age: savedUser.age,
        gender: savedUser.gender,
        about: savedUser.about,
        skills: savedUser.skills,
        isPremium: savedUser.isPremium,
        membershipType: savedUser.membershipType,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Signup failed",
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Validate email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Validate password
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    // Create a JWT token
    const jwtToken = await user.getJWT();

    // Create cookie and send response
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        photo: user.photo,
        age: user.age,
        gender: user.gender,
        about: user.about,
        skills: user.skills,
        isPremium: user.isPremium,
        membershipType: user.membershipType,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Login failed",
    });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(Date.now()),
  });
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

module.exports = authRouter;