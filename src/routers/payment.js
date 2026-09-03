const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");
const { membershipAmount } = require("../utils/constants");
const { validatePaymentCreate } = require("../utils/validate");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    validatePaymentCreate(membershipType);

    const { firstName, lastName, email } = req.user;

    const receipt = `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: receipt,
      notes: {
        firstName: firstName || "",
        lastName: lastName || "",
        emailId: email || "",
        membershipType: membershipType,
      },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    res.json({
      success: true,
      ...savedPayment.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message,
      message: err.message,
    });
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    console.log("Payment Webhook Received");
    const webhookSignature = req.get("X-Razorpay-Signature");

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        msg: "Webhook signature header missing",
      });
    }

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      console.log("Invalid Webhook Signature");
      return res.status(400).json({
        success: false,
        msg: "Webhook signature is invalid",
      });
    }

    console.log("Valid Webhook Signature. Event:", req.body?.event);

    const paymentDetails = req.body?.payload?.payment?.entity;

    if (paymentDetails && paymentDetails.order_id) {
      const payment = await Payment.findOne({
        orderId: paymentDetails.order_id,
      });

      if (payment) {
        payment.status = paymentDetails.status;
        payment.paymentId = paymentDetails.id;
        await payment.save();

        if (
          req.body.event === "payment.captured" ||
          paymentDetails.status === "captured"
        ) {
          const user = await User.findOne({ _id: payment.userId });
          if (user) {
            user.isPremium = true;
            user.membershipType = payment.notes?.membershipType || "silver";
            await user.save();
            console.log(`User ${user._id} upgraded to premium (${user.membershipType})`);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      msg: "Webhook received successfully",
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({
      success: false,
      msg: err.message,
      message: err.message,
    });
  }
});

paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  try {
    const user = req.user.toJSON();
    return res.json({
      success: true,
      isPremium: Boolean(user.isPremium),
      membershipType: user.membershipType || null,
      ...user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = paymentRouter;
