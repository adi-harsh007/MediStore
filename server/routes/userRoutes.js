const express = require("express");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const prisma = require("../prismaClient");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Rate limit password changes: 5 attempts per 15 minutes
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many password change attempts. Try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sanitize and enforce max lengths
function sanitizeProfile({ name, phone, address }) {
  return {
    ...(name && { name: String(name).trim().slice(0, 100) }),
    ...(phone !== undefined && { phone: phone ? String(phone).trim().slice(0, 15) : null }),
    ...(address !== undefined && { address: address ? String(address).trim().slice(0, 500) : null })
  };
}

// GET current user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } }
      }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE user profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const data = sanitizeProfile(req.body);

    if (data.name !== undefined && data.name.length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true
      }
    });
    res.json(updated);
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// CHANGE password
router.put("/password", authMiddleware, passwordLimiter, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { passwordHash: hash }
    });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password change error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
