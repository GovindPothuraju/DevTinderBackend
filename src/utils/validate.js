const validator = require("validator");

const validateSignupData = (req) => {
  const allowedFields = ["firstName", "lastName", "email", "password"];

  const updates = Object.keys(req.body);
  const isValid = updates.every(key => allowedFields.includes(key));
  if (!isValid) {
    throw new Error("Invalid fields provided");
  }

  const { firstName, lastName, email, password } = req.body;

  if (!firstName || firstName.trim().length < 2 || firstName.trim().length > 30) {
    throw new Error("First name must be between 2 and 30 characters");
  }

  if (!lastName || lastName.trim().length < 2 || lastName.trim().length > 30) {
    throw new Error("Last name must be between 2 and 30 characters");
  }

  if (!email || !validator.isEmail(email)) {
    throw new Error("Valid email is required");
  }

  if (!password || !validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};

const validateProfileUpdate = (req) => {
  const allowed = ["firstName", "lastName", "age", "gender", "photo", "skills", "about"];
  const updates = Object.keys(req.body);

  const isValid = updates.every(key => allowed.includes(key));
  if (!isValid) {
    throw new Error("Invalid fields in update");
  }

  const { firstName, lastName, age, gender, photo, skills, about } = req.body;

  if (firstName && (firstName.trim().length < 2 || firstName.trim().length > 30)) {
    throw new Error("First name is invalid");
  }

  if (lastName && (lastName.trim().length < 2 || lastName.trim().length > 30)) {
    throw new Error("Last name is invalid");
  }

  if (age && (isNaN(age) || age < 13 || age > 120)) {
    throw new Error("Age is invalid");
  }

  if (gender && !["male", "female", "other"].includes(gender)) {
    throw new Error("Gender is invalid");
  }

  if (photo && !validator.isURL(photo)) {
    throw new Error("Photo URL is invalid");
  }

  if (skills) {
    if (!Array.isArray(skills)) {
      throw new Error("Skills must be an array");
    }
    if (skills.length === 0 || skills.length > 50) {
      throw new Error("Skills length must be between 1 and 50");
    }
    if (!skills.every(skill => typeof skill === "string" && skill.trim())) {
      throw new Error("Each skill must be a non-empty string");
    }
  }

  if (about && (about.trim().length < 2 || about.trim().length > 300)) {
    throw new Error("About must be between 2 and 200 characters");
  }
};

module.exports = { validateSignupData, validateProfileUpdate };
