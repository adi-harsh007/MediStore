const express = require("express");
const crypto = require("crypto");
const prisma = require("../prismaClient");
const { authMiddleware } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

// Check if Razorpay keys are configured (not placeholder)
const hasRazorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== "rzp_test_YourKeyId";

let razorpay = null;
if (hasRazorpay) {
  const Razorpay = require("razorpay");
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Upload prescription
router.post("/upload", authMiddleware, upload.single("prescription"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Create an order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, prescriptionUrl } = req.body;
    const userId = req.user.userId;

    // --- Validate items array ---
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.productId || !item.quantity || typeof item.quantity !== "number" || item.quantity < 1 || !Number.isInteger(item.quantity)) {
        return res.status(400).json({ error: "Each item must have a valid productId and quantity (positive integer)" });
      }
    }

    // --- Fetch products from DB to calculate real prices ---
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    // Verify all products exist
    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p.id);
      const missing = productIds.filter(id => !foundIds.includes(id));
      return res.status(400).json({ error: `Products not found: ${missing.join(", ")}` });
    }

    // Check stock availability and quantities
    const outOfStock = [];
    const itemMap = new Map(items.map(i => [i.productId, i.quantity]));
    for (const p of products) {
      const requestedQty = itemMap.get(p.id);
      if (!p.inStock || p.stock < requestedQty) {
        outOfStock.push(p.name);
      }
    }
    if (outOfStock.length > 0) {
      return res.status(400).json({ error: `Insufficient stock for: ${outOfStock.join(", ")}` });
    }

    // Build price map and calculate server-side total
    const priceMap = {};
    for (const p of products) {
      priceMap[p.id] = p.price;
    }

    let totalAmount = 0;
    const orderItems = items.map(item => {
      const price = priceMap[item.productId];
      totalAmount += price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: price
      };
    });

    // Round to 2 decimal places
    totalAmount = Math.round(totalAmount * 100) / 100;

    // Decrement stock for the ordered items
    const stockUpdates = items.map(item => 
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
    );
    await Promise.all(stockUpdates);

    if (razorpay) {
      // --- Razorpay flow ---
      const options = {
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`
      };
      const razorpayOrder = await razorpay.orders.create(options);

      const order = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          paymentId: razorpayOrder.id,
          prescriptionUrl: prescriptionUrl || null,
          items: { create: orderItems }
        }
      });

      return res.json({
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        useRazorpay: true
      });
    } else {
      // --- Direct order (no payment gateway) ---
      const order = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          status: "PENDING",
          prescriptionUrl: prescriptionUrl || null,
          items: { create: orderItems }
        },
        include: { items: true }
      });

      return res.json({
        orderId: order.id,
        message: "Order placed successfully!",
        useRazorpay: false
      });
    }
  } catch (err) {
    console.error("Create order error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Verify payment and update order (Razorpay callback)
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // All three fields are required for verification
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification fields" });
    }

    // Verify the Razorpay signature using HMAC-SHA256
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Payment verification failed: signature mismatch");
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Signature is valid — update order status
    await prisma.order.updateMany({
      where: { 
        paymentId: razorpay_order_id,
        userId: req.user.userId
      },
      data: { status: "PENDING" }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Verify error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user orders
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
