import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Msg from "../models/Msg.js";
import twilio from "twilio";
import crypto from "crypto";
import { transporter } from "../utils/sendEmail.js";
import Otp from "../models/Otp.js";
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
export const renderLogin = (req, res) => {
 res.render("login");
};

export const renderSignup = (req, res) => {
  res.render("signup");
};


export const  about = async (req, res) => {
   
    try {
      res.redirect("/account/about");
    } catch (error) {
      console.log(error);
    }
}

export const  contact = async (req, res) => {
   
   const { nname, email, message } = req.body;

  try {
     await Msg.create({ nname, email, message });
    await client.messages.create({
      body: `📩 NEW CONTACT MESSAGE:\n\nName: ${nname}\nEmail: ${email}\nMessage: ${message}`,
      from: process.env.TWILIO_PHONE,
      to: process.env.MY_PHONE,
    });

      res.redirect("/account/dashboard");
  } catch (error) {
    console.error(error);
    res.send(`<h2 style="color:red;">Failed to Send SMS ❌</h2>`);
  }
};

export const signupUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.render("signup", { error: "All fields required" });
    }

    email = email.toLowerCase();

    const exists = await User.findOne({ email });
    if (exists) {
      return res.render("signup", { error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email
    };

    res.redirect("/account/dashboard");
  } catch (err) {
    console.error(err);
    res.render("signup", { error: "Something went wrong" });
  }
};

export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.render("login", { error: "All fields required" });
    }

    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", { error: " login Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
  
    if (!match) {
      return res.render("login", { error: " Paaword Invalid credentials" });
    }

    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email
    };

    res.redirect("/account/dashboard");
  } catch (err) {
    console.error(err);
    res.render("login", { error: "Something went wrong" });
  }
};

export const logoutUser = (req, res) => {
req.session.destroy(() => {
  res.redirect("/login");
  });
};

// FORGOT PASSWORD PAGE
export const forgotPage = (req, res) => {
  res.render("forgot", { msg: null, showOtp: false, email: "" });
};

// SEND OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Validate email
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    // 2️⃣ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3️⃣ Delete old OTPs
    await Otp.deleteMany({ email });

    // 4️⃣ Save OTP in DB
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    // 5️⃣ Send OTP email
    await transporter.sendMail({
      from:  `"Income Expense App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
       html: `
      <h2>Password Reset</h2>
      <p>Your OTP is:</p>
      <h1 style="color:green;">${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
    `
    });

    res.render("forgot", {
    msg: "OTP sent to your email",
    showOtp: true,
    email
  });
  } catch (error) {
    console.error("OTP ERROR:", error);
    res.status(500).json({ error: "OTP sending failed" });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  
  const { email, otp } = req.body;

  const record = await Otp.findOne({ email });

  if (!record) {
    return res.render("forgot", {
      msg: "OTP not found. Please resend.",
      showOtp: true,
      email
    });
  }

  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ email });
    return res.render("forgot", {
      msg: "OTP expired. Please resend.",
      showOtp: true,
      email
    });
  }

  if (record.otp !== otp) {
    return res.render("forgot", {
      msg: "Invalid OTP",
      showOtp: true,
      email
    });
  }

  // ✅ OTP valid
  await Otp.deleteOne({ email });

  // ✅ FIXED REDIRECT
  res.redirect(`/reset?email=${email}`);
 };


// RESET PASSWORD PAGE
export const resetPage = (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.redirect("/forgot");
  }

  res.render("reset", { email, msg: null });
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render("reset", {
      email,
      msg: "Passwords do not match"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.updateOne(
    { email },
    { password: hashedPassword }
  );

  res.redirect("/login");
};