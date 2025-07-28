const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../../models/userModel");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (user) => {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiry = Date.now() + 3600000; // 1 hour

  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = verificationTokenExpiry;
  await user.save();

  const verificationUrl = `${process.env.APP_BASE_URL}/api/v1/verify-email?token=${verificationToken}`;

  await transporter.sendMail({
    to: user.email,
    subject: "Please Verify Your Email Address",
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email address. This link expires in 1 hour.</p>`,
  });
};

module.exports = sendVerificationEmail;
