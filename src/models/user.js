const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 30,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 128,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is not strong enough");
        }
      },
    },
    age: {
      type: Number,
      min: 13,
      max: 120,
    },
    gender: {
      type: String,
      lowercase: true,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be male, female, or other",
      },
    },
    photo: {
      type: String,
      default: "https://api.dicebear.com/7.x/bottts/svg?seed=dev",
      validate(value) {
        if (value && value.trim() && !validator.isURL(value)) {
          throw new Error("Photo must be a valid URL");
        }
      },
    },
    role: {
      type: String,
      trim: true,
      default: "Software Engineer",
      maxlength: 50,
    },
    skills: {
      type: [String],
      default: ["JavaScript", "React"],
    },
    about: {
      type: String,
      trim: true,
      maxlength: [300, "About section cannot exceed 300 characters"],
      default: "Building amazing things with code!",
      validate(value) {
        if (value && /<[^>]*>/.test(value)) {
          throw new Error("About must not contain HTML tags");
        }
      },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
      enum: {
        values: ["silver", "gold", null],
        message: "Membership type must be either silver or gold",
      },
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHashed = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHashed
  );
  return isPasswordValid;
};

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

module.exports = mongoose.model("User", userSchema);