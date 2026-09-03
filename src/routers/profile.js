const express = require("express");
const profileRouter = express.Router();
const validator = require("validator");
const bcrypt = require("bcrypt");

const { userAuth } = require("../middlewares/auth");
const { validateProfileUpdate } = require("../utils/validate");

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
      skills: user.skills,
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
    // Validate (throws error if invalid)
    validateProfileUpdate(req);

    // Update logged-in user
    const loggedInUser = req.user;
    const updates = req.body;

    Object.keys(updates).forEach((key) => {
      loggedInUser[key] = updates[key];
    });

    await loggedInUser.save();

    // Success response
    res.status(200).json({
      success: true,
      message: `${loggedInUser.firstName} profile updated successfully`,
      data: {
        _id: loggedInUser._id,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        email: loggedInUser.email,
        photo: loggedInUser.photo,
        skills: loggedInUser.skills,
        age: loggedInUser.age,
        gender: loggedInUser.gender,
        about: loggedInUser.about,
        isPremium: loggedInUser.isPremium || false,
        membershipType: loggedInUser.membershipType || null,
      },
    });
  } catch (err) {
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
