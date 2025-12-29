import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER, // YOUR gmail
//     pass: process.env.EMAIL_PASS  // App password
//   }
// });
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// export const sendEmail = async (toEmail, otp) => {
//   await transporter.sendMail({
//     from: `"Income Expense App" <${process.env.EMAIL_USER}>`,
//     to: toEmail, // 👈 USER ENTERED EMAIL
//     subject: "Password Reset OTP",
//     html: `
//       <h2>Password Reset</h2>
//       <p>Your OTP is:</p>
//       <h1 style="color:green;">${otp}</h1>
//       <p>This OTP is valid for 5 minutes.</p>
//     `
//   });
// };
