const { User, validate } = require("../model/User");
const { OTP } = require("../model/OTP");
const mongoose = require("mongoose");
const cloudinary = require("../utils/cloudinary");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

async function signupController(req, res) {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ msg: "validation error", error: error.details[0].message });
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ msg: "user already registered.." });
    }
    const result = await cloudinary.uploader.upload(
      "../IEEE API/uploads/profile.png",
      {
        folder: "members",
      }
    );
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
      verified: false,
      role: "USER",
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      university_code: req.body.university_code,
    });

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "Gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    let otp = await Math.floor(1000 + Math.random() * 9000);

    let message = {
      from: "IEEE OSB",
      to: req.body.email,
      subject: "Verify Creating Account",
      text: `Your Verification code is ${otp}, Please don't share it with anyone, this code will expire in 2 minutes`,
      html: `<p>Your Verification code is<br><h1>${otp}</h1><br>Please don't share it with anyone.<br>this code will expire in 2 minutes`,
    };
    await transporter.sendMail(message).catch((err) => {
      return res.status(400).json({ error: true, msg: "OTP NOT SENT..." });
    });

    const d = new Date();
    d.setMinutes(d.getMinutes());
    const d2 = new Date();
    d.setMinutes(d.getMinutes() + 2);

    let OTP_Obj = new OTP({
      code: await bcrypt.hash(String(otp), 10),
      email: user.email,
      createdAt: Number(d),
      expiresAt: Number(d2),
      verified: false,
    });

    await user.save();

    const userWithoutPassword = { ...user };
    delete userWithoutPassword._doc.password;
    
    await OTP_Obj.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRE_IN,
    });

    res.status(201).json({
      user: userWithoutPassword._doc,
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
}

async function resendOTP(req, res) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ error: "user not found.." });
  }
  await OTP.deleteMany({ email: user.email });
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "Gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  let otp = await Math.floor(1000 + Math.random() * 9000);

  let message = {
    from: "IEEE OSB",
    to: req.body.email,
    subject: "Verify Creating Account",
    text: `Your Verification code is ${otp}, Please don't share it with anyone, this code will expire in 2 minutes`,
    html: `<p>Your Verification code is<br><h1>${otp}</h1><br>Please don't share it with anyone.<br>this code will expire in 2 minutes`,
  };
  await transporter.sendMail(message).catch((err) => {
    return res.status(400).json({ error: true, msg: "OTP NOT SENT..." });
  });

  const d = new Date();
  d.setMinutes(d.getMinutes());
  const d2 = new Date();
  d.setMinutes(d.getMinutes() + 200);

  let OTP_Obj = new OTP({
    code: await bcrypt.hash(String(otp), 10),
    email: req.body.email,
    createdAt: Number(d),
    expiresAt: Number(d2),
    verified: false,
  });

  await OTP_Obj.save();
  res.status(201).json({ msg: "code sent.." });
}

async function verify(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }
    if (user.verified) {
      return res.status(400).json({ msg: "User already verified." });
    }
    const otp = await OTP.findOne({ email: user.email });
    if (!otp) {
      return res.status(404).json({ msg: "No OTP was sent." });
    }
    let d = new Date();
    if (Number(d) < Number(otp.expiresAt)) {
      return res.status(400).json({ msg: "OTP has expired." });
    }
    if (!(await bcrypt.compare(req.body.otp, otp.code))) {
      return res.status(401).json({ msg: "Wrong code." });
    }
    user.verified = true;
    await user.save();
    await OTP.deleteMany({ email: user.email });
    return res.status(200).json({ msg: "User verified successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error." });
  }
}

async function resetRequest(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }
    const otp = await OTP.findOne({ email: user.email });
    if (!otp) {
      return res.status(404).json({ msg: "No OTP was sent." });
    }
    let d = new Date();
    if (Number(d) < Number(otp.expiresAt)) {
      return res.status(400).json({ msg: "OTP has expired." });
    }
    if (!(await bcrypt.compare(req.body.otp, otp.code))) {
      return res.status(401).json({ msg: "Wrong code." });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRE_IN,
    });
    await OTP.deleteMany({ email: user.email });
    return res.status(200).json({ msg: "Procced to reset password..", token: token });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error." });
  }
}

async function resetPassword(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }
    const newPass = await bcrypt.hash(req.body.password, 10);
    user.password = newPass;
    await user.save();
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "Gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    let message = {
      from: "IEEE OSB",
      to: req.body.email,
      subject: "Password Changed",
      text: `Your password has been changed! If you believe you didn't attempt changing your password please contact us.`,
      html: `<h1>Your password has been changed!<h1><br><p>If you believe you didn't attempt changing your password please contact us.</p>`,
    };
    await transporter.sendMail(message).catch((err) => {
      return res.status(400).json({ error: true, msg: "Email not sent" });
    });
    return res.status(200).json({ msg: "password changed successfuly!" });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error." });
  }
}

module.exports = {
  signupController,
  verify,
  resendOTP,
  resetPassword,
  resetRequest,
};
