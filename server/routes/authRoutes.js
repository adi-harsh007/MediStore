const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const prisma = require("../prismaClient");
const { sendVerificationEmail } = require("../emailService");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Rate limiting: max 10 attempts per IP per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Resend limiter: 1 per 60 seconds
const resendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: { error: "Please wait 60 seconds before requesting a new code." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email format validation
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

// Signup — creates unverified account + sends OTP
router.post("/signup", authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing verified user
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing && existing.emailVerified) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const code = generateOTP();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existing && !existing.emailVerified) {
      // Update existing unverified account
      await prisma.user.update({
        where: { email: cleanEmail },
        data: { name: name.trim(), passwordHash, verificationCode: code, codeExpiry }
      });
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          verificationCode: code,
          codeExpiry,
          emailVerified: false
        },
      });
    }

    // Send OTP email
    await sendVerificationEmail(cleanEmail, code);

    res.json({ needsVerification: true, email: cleanEmail, message: "Verification code sent to your email" });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// Verify email with OTP
router.post("/verify-email", authLimiter, async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and verification code are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return res.status(400).json({ error: "Account not found" });
    }
    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified. Please login." });
    }
    if (user.verificationCode !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }
    if (new Date() > new Date(user.codeExpiry)) {
      return res.status(400).json({ error: "Code expired. Please request a new one." });
    }

    // Mark as verified, clear code
    const verified = await prisma.user.update({
      where: { email: cleanEmail },
      data: { emailVerified: true, verificationCode: null, codeExpiry: null }
    });

    // Issue JWT — user is now logged in
    const token = jwt.sign({ userId: verified.id, role: verified.role }, JWT_SECRET, { expiresIn: "1d" });
    res.json({
      token,
      user: { id: verified.id, name: verified.name, email: verified.email, role: verified.role, isAdmin: verified.role === "ADMIN" }
    });
  } catch (err) {
    console.error("Verify error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Resend verification code
router.post("/resend-code", resendLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return res.status(400).json({ error: "Account not found" });
    }
    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    const code = generateOTP();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email: cleanEmail },
      data: { verificationCode: code, codeExpiry }
    });

    await sendVerificationEmail(cleanEmail, code);

    res.json({ message: "New verification code sent" });
  } catch (err) {
    console.error("Resend error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Login — only verified users
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Block unverified users
    if (!user.emailVerified) {
      return res.status(403).json({ error: "Please verify your email first", needsVerification: true, email: cleanEmail });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, isAdmin: user.role === "ADMIN" } });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Google Login / Signup
router.post("/google-login", authLimiter, async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "Google ID Token is required" });

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Invalid Google token payload" });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || "Google User";
    const emailVerified = payload.email_verified; // Boolean from Google

    if (!emailVerified) {
      return res.status(403).json({ error: "Your Google email is not verified" });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create a new user for this Google account
      // Use an impossible bcrypt hash so password login is disabled for this user unless they reset it
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: "__GOOGLE_OAUTH__",
          emailVerified: true
        }
      });
    } else if (!user.emailVerified) {
      // If user existed but wasn't verified, mark them verified now since they used Google
      user = await prisma.user.update({
        where: { email },
        data: { emailVerified: true }
      });
    }

    // Issue JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, isAdmin: user.role === "ADMIN" } });

  } catch (err) {
    console.error("Google Login Error:", err.message);
    res.status(401).json({ error: "Invalid or expired Google token" });
  }
});

module.exports = router;
