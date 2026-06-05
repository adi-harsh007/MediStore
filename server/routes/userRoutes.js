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

// GET user wishlist
router.get("/wishlist", authMiddleware, async (req, res) => {
  try {
    const wishlists = await prisma.wishlist.findMany({
      where: { userId: req.user.userId },
      include: {
        product: {
          include: {
            reviews: { select: { rating: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedWishlists = wishlists.map(w => {
      const reviewCount = w.product.reviews.length;
      const avgRating = reviewCount > 0 ? (w.product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1) : 0;
      const { reviews, ...restProduct } = w.product;
      return {
        ...w,
        product: { ...restProduct, rating: Number(avgRating), reviews: reviewCount }
      };
    });

    res.json(formattedWishlists);
  } catch (err) {
    console.error("Get wishlist error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// POST add to wishlist
router.post("/wishlist", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: "Product ID is required" });

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user.userId, productId: parseInt(productId) } }
    });

    if (existing) {
      return res.status(400).json({ error: "Product is already in wishlist" });
    }

    const item = await prisma.wishlist.create({
      data: {
        userId: req.user.userId,
        productId: parseInt(productId)
      }
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("Add wishlist error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE from wishlist
router.delete("/wishlist/:productId", authMiddleware, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    
    // Using deleteMany in case the unique constraint isn't perfect, but delete works too with compound key
    await prisma.wishlist.delete({
      where: { userId_productId: { userId: req.user.userId, productId } }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Remove wishlist error:", err.message);
    // If it doesn't exist, prisma throws P2025
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Item not in wishlist" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
