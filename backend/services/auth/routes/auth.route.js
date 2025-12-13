// naming this file as auth.route.js is just a convention, you could have named it auth.js also no issue absolutely
import express from "express";
import { login, logout, signup, verifyEmail, forgotPassword, resetPassword, checkAuth } from "../controller/auth.controller.js";
import { loginLimiter } from "../middleware/loginRateLimiter.js"; // ratelimiter to prevent user from abusing multiple login attempts
import { verifyToken } from "../middleware/verifyToken.js";

// this is just a mini version of app = express(), ideally in your application express() should be called once only
// you cant push everything into the main app (all routes being there is very messy)
const router = express.Router();

// this below route is called whenever we refresh our page, this checks whether our user is authenticated or not, we just need to verifyToken
router.get('/check-auth', verifyToken, checkAuth);

router.post('/signup', signup);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);

router.post("/verify-email", verifyEmail);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword); // since token can be dynamic so put a colon before it as :token

export default router;