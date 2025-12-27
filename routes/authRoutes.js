import express from "express";

import { renderLogin, renderSignup, signupUser, loginUser, logoutUser,about, contact, forgotPage,
  sendOtp,
  verifyOtp,
  resetPage,
  resetPassword} from"../controllers/authController.js";


const router = express.Router();

router.get("/", (req, res) => res.redirect('/login'));
 router.get("/about", about);
 
 router.get("/contact", (req, res) => res.render("contact")); 
router.post("/contact", contact);
router.get("/login", renderLogin);
router.get("/signup", renderSignup);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

router.get("/forgot", forgotPage);
router.post("/forgot/send-otp", sendOtp);
router.post("/forgot/verify-otp", verifyOtp);

router.get("/reset", resetPage);
router.post("/reset", resetPassword);
export default router;
