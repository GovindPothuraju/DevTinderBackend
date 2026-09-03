const express = require("express");
const profileRouter = express.Router();
const validator = require("validator");
const bcrypt = require("bcrypt");

const { userAuth } = require("../middlewares/auth");
const { validateProfileUpdate } = require("../utils/validate");
const User = require("../models/user");

// -- PROFILE ROUTER
// - GET    /profile/view      → View own profile
// - PATCH  /profile/edit      → Edit profile details
// - PATCH  /profile/password  → Change password

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const safeUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      photo: user.photo,
      role: user.role || "Software Engineer",
      skills: user.skills || [],
      age: user.age,
      gender: user.gender,
      about: user.about,
      isPremium: user.isPremium || false,
      membershipType: user.membershipType || null,
    };

    res.status(200).json(safeUser);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error fetching profile: " + err.message,
    });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // 1. Validate fields
    validateProfileUpdate(req);

    const loggedInUser = req.user;
    const updates = req.body;

    const allowedFields = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "photo",
      "skills",
      "about",
      "role",
    ];

    allowedFields.forEach((key) => {
      if (updates[key] !== undefined) {
        if (key === "age") {
          loggedInUser.age =
            updates.age === "" || updates.age === null
              ? undefined
              : Number(updates.age);
        } else {
          loggedInUser[key] = updates[key];
        }
      }
    });

    const savedUser = await loggedInUser.save();

    res.status(200).json({
      success: true,
      message: `${savedUser.firstName} profile updated successfully`,
      data: {
        _id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        photo: savedUser.photo,
        role: savedUser.role || "Software Engineer",
        skills: savedUser.skills,
        age: savedUser.age,
        gender: savedUser.gender,
        about: savedUser.about,
        isPremium: savedUser.isPremium || false,
        membershipType: savedUser.membershipType || null,
      },
    });
  } catch (err) {
    console.error("Profile edit error:", err);
    res.status(400).json({
      success: false,
      error: "Update failed",
      message: err.message,
    });
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      throw new Error("All fields (oldPassword, newPassword, confirmPassword) are required");
    }

    const loggedInUser = req.user;

    const isMatch = await loggedInUser.validatePassword(oldPassword);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    if (oldPassword === newPassword) {
      throw new Error("New password must be different from old password");
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("New password is not strong enough");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("New password and confirm password do not match");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    loggedInUser.password = hashedPassword;
    await loggedInUser.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Password update failed",
      message: err.message,
    });
  }
});

module.exports = profileRouter;
