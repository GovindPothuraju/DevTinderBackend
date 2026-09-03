const validator = require("validator");
const { membershipAmount } = require("./constants");

const validateSignupData = (req) => {
  const allowedFields = ["firstName", "lastName", "email", "password"];

  const updates = Object.keys(req.body);
  const isValid = updates.every((key) => allowedFields.includes(key));
  if (!isValid) {
    throw new Error("Invalid fields provided");
  }

  const { firstName, lastName, email, password } = req.body;

  if (!firstName || firstName.trim().length < 2 || firstName.trim().length > 30) {
    throw new Error("First name must be between 2 and 30 characters");
  }

  if (!lastName || lastName.trim().length < 1 || lastName.trim().length > 30) {
    throw new Error("Last name must be between 1 and 30 characters");
  }

  if (!email || !validator.isEmail(email)) {
    throw new Error("Valid email is required");
  }

  if (!password || !validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};

const validateProfileUpdate = (req) => {
  const allowed = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photo",
    "skills",
    "about",
    "role",
  ];
  const updates = Object.keys(req.body);

  const isValid = updates.every((key) => allowed.includes(key));
  if (!isValid) {
    throw new Error("Invalid fields in update");
  }

  const { firstName, lastName, age, gender, photo, skills, about, role } = req.body;

  if (
    firstName !== undefined &&
    (!firstName || firstName.trim().length < 2 || firstName.trim().length > 30)
  ) {
    throw new Error("First name must be between 2 and 30 characters");
  }

  if (
    lastName !== undefined &&
    (!lastName || lastName.trim().length < 1 || lastName.trim().length > 30)
  ) {
    throw new Error("Last name must be between 1 and 30 characters");
  }

  if (age !== undefined && age !== "" && age !== null) {
    const numAge = Number(age);
    if (isNaN(numAge) || numAge < 13 || numAge > 120) {
      throw new Error("Age must be between 13 and 120");
    }
  }

  if (
    gender !== undefined &&
    gender !== "" &&
    !["male", "female", "other"].includes(gender.toLowerCase())
  ) {
    throw new Error("Gender must be male, female, or other");
  }

  if (photo && typeof photo === "string" && photo.trim()) {
    if (!validator.isURL(photo)) {
      throw new Error("Photo must be a valid URL");
    }
  }

  if (role && typeof role === "string" && role.length > 50) {
    throw new Error("Role title cannot exceed 50 characters");
  }

  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      throw new Error("Skills must be an array");
    }
    if (skills.length > 50) {
      throw new Error("Skills cannot exceed 50 items");
    }
  }

  if (about && about.length > 300) {
    throw new Error("About section cannot exceed 300 characters");
  }
};

const validatePaymentCreate = (membershipType) => {
  if (!membershipType || !membershipAmount[membershipType]) {
    throw new Error(
      "Invalid membership type. Allowed options: " +
        Object.keys(membershipAmount).join(", ")
    );
  }
};

const validateChatMessage = (text) => {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Message text cannot be empty");
  }
  if (text.length > 2000) {
    throw new Error("Message exceeds maximum length of 2000 characters");
  }
};

module.exports = {
  validateSignupData,
  validateProfileUpdate,
  validatePaymentCreate,
  validateChatMessage,
};
