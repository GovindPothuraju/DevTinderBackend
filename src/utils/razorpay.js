require("dotenv").config();
const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

module.exports = razorpayInstance;
