const { User, validate } = require("../model/User");
const { OTP } = require("../model/OTP");
const cloudinary = require("../utils/cloudinary");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const path = require("path");

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
      path.resolve("./uploads", "profile.png"),
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
      text: `Your Verification code is ${otp}, Please don't share it with anyone, this code will expire in 5 minutes`,
      html: `<p>Your Verification code is<br><h1>${otp}</h1><br>Please don't share it with anyone.<br>this code will expire in 5 minutes`,
    };
    await transporter.sendMail(message).catch((err) => {
      return res.status(400).json({ error: true, msg: "OTP NOT SENT..." });
    });

    const d = new Date();
    d.setMinutes(d.getMinutes());
    const d2 = new Date();
    d.setMinutes(d.getMinutes() + 5);

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

async function google(req, res) {
  try {
    let user = await User.findOne({ email: req.user.emails[0].value });
    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword._doc.password;
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE_IN,
      });
      return res.status(200).json({
        user: userWithoutPassword._doc,
        token: token,
      });
    }
    user = new User({
      name: req.user.displayName,
      email: req.user.emails[0].value,
      password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
      verified: req.user.emails[0].verified,
      role: "USER",
      image: {
        public_id: req.user.id,
        url: req.user.photos[0].value,
      },
      university_code: "null",
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

    let message = {
      from: "IEEE OSB",
      to: req.user.emails[0].value,
      subject: "Welcome to IEEE OSB",
      text: `Congrats! and welcome to IEEE OSB, your account have been created successfuly.`,
      html: `<h1>Congrats!</h1><br><p>and welcome to IEEE OSB, your account have been created successfuly.</p>`,
    };
    await transporter.sendMail(message).catch((err) => {
      return res.status(400).json({ error: true, msg: "MAIL NOT SENT..." });
    });

    await user.save();
    const userWithoutPassword = { ...user };
    delete userWithoutPassword._doc.password;

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRE_IN,
    });

    res.status(200).json({
      user: userWithoutPassword._doc,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
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
    text: `Your Verification code is ${otp}, Please don't share it with anyone, this code will expire in 5 minutes`,
    html: `<p>Your Verification code is<br><h1>${otp}</h1><br>Please don't share it with anyone.<br>this code will expire in 5 minutes`,
  };
  await transporter.sendMail(message).catch((err) => {
    return res.status(400).json({ error: true, msg: "OTP NOT SENT..." });
  });

  const d = new Date();
  d.setMinutes(d.getMinutes());
  const d2 = new Date();
  d.setMinutes(d.getMinutes() + 5);

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
    return res
      .status(200)
      .json({ msg: "Procced to reset password..", token: token });
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

async function createEditorController(req, res) {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ msg: "validation error", error: error.details[0].message });
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ msg: "editor already registered.." });
    }
    const result = await cloudinary.uploader.upload(
      path.resolve("./uploads", "profile.png"),
      {
        folder: "editors",
      }
    );
    var randomstring = Math.random().toString(36).slice(-8);
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(randomstring, 10),
      verified: true,
      role: "EDITOR",
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

    let message = {
      from: "IEEE OSB",
      to: req.body.email,
      subject: "Welcome on board!",
      text: `Congrats! Your Editor account have been successfuly created, Your Email Address is ${req.body.email} and your password is ${randomstring}, please don't share it with anyone!`,
      html: `<h1>Congrats! Your Editor account have been successfuly created</h1><br><p>Your Email Address is <h3>${req.body.email}</h3> and your password is <h3>${randomstring}</h3>, please don't share it with anyone!</p>`,
    };
    await transporter.sendMail(message).catch((err) => {
      return res.status(400).json({ error: true, msg: "MAIL NOT SENT..." });
    });
    await user.save();

    const userWithoutPassword = { ...user };
    delete userWithoutPassword._doc.password;

    return res.status(201).json({
      user: userWithoutPassword._doc,
    });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function resetEditorPasswordController(req, res) {
  try {
    const editor = await User.findOne({ email: req.body.email });
    if (!editor) {
      return res.status(404).json({ msg: "editor not found" });
    }
    var randomstring = Math.random().toString(36).slice(-8);
    editor.password = await bcrypt.hash(randomstring, 10);
    editor.save();

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
      subject: "Password Changed Successfuly",
      text: `Your Editor accounts' password have been successfuly changed, Your Email Address is ${req.body.email} and your new password is ${randomstring}, please don't share it with anyone!`,
      html: `<h1>Your Editor accounts' password have been successfuly changed</h1><br><p>Your Email Address is <h3>${req.body.email}</h3> and your new password is <h3>${randomstring}</h3>, please don't share it with anyone!</p>`,
    };
    await transporter.sendMail(message).catch((err) => {
      return res.status(400).json({ error: true, msg: "MAIL NOT SENT..." });
    });

    return res.status(200).json({ msg: "password changed successfuly" });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function updateUserAccount(req, res) {
  try {
    const user = await User.findById(req.body.id);
    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }
    let updatedUser;
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        path.resolve("./uploads", req.file.filename),
        {
          folder: "members",
        }
      );
      updatedUser = {
        phone: req.body.phone || user.phone,
        university_year: req.body.university_year || user.university_year,
        image: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      };
    } else {
      updatedUser = {
        phone: req.body.phone || user.phone,
        university_year: req.body.university_year || user.university_year,
      };
    }
    await user.updateOne(updatedUser);
    return res.status(200).json({ msg: "user updated successfuly" });
  } catch (error) {
    return res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function deleteEditor(req, res) {
  try {
    const editor = await User.findById(req.params.id);
    if (!editor) {
      return res.status(404).json({ msg: "editor not found" });
    }
    if (editor.role != "EDITOR") {
      return res.status(400).json({ msg: "this account is not an editor" });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ msg: "editor deleted successfuly" });
  } catch (error) {
    res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

async function getEditors(req, res) {
  try {
    const editors = await User.find({ role: "EDITOR" });
    if (!editors) {
      return res.status(404).json({ msg: "no editors found" });
    }
    return res.status(200).json({ data: editors });
  } catch (error) {
    res.status(500).json({ msg: "INTERNAL SERVER ERROR" });
  }
}

module.exports = {
  signupController,
  verify,
  resendOTP,
  resetPassword,
  resetRequest,
  createEditorController,
  resetEditorPasswordController,
  updateUserAccount,
  deleteEditor,
  getEditors,
  google,
};
