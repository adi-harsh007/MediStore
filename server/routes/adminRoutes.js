const express = require("express");
const rateLimit = require("express-rate-limit");
const prisma = require("../prismaClient");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Rate limiting for admin routes: max 100 requests per 15 minutes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many admin requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authMiddleware, adminMiddleware, adminLimiter);

// Allowed product fields (whitelist)
const ALLOWED_PRODUCT_FIELDS = [
  "name", "category", "price", "originalPrice", "rating", "reviews",
  "icon", "color", "description", "dosage", "prescriptionRequired",
  "inStock", "stock", "isActive", "manufacturer"
];

// Valid order statuses
const VALID_STATUSES = ["PENDING", "PROCESSING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

function pickProductFields(body) {
  const data = {};
  for (const key of ALLOWED_PRODUCT_FIELDS) {
    if (body[key] !== undefined) {
      data[key] = body[key];
    }
  }
  return data;
}

// Add product
router.post("/products", async (req, res) => {
  try {
    const data = pickProductFields(req.body);

    // Validate required fields
    if (!data.name || !data.category || !data.price || !data.manufacturer) {
      return res.status(400).json({ error: "Name, category, price, and manufacturer are required" });
    }

    const product = await prisma.product.create({ data });
    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update product
router.put("/products/:id", async (req, res) => {
  try {
    const data = pickProductFields(req.body);
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    res.json(product);
  } catch (err) {
    console.error("Update product error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete product
router.delete("/products/:id", async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false, inStock: false, stock: 0 }
    });
    res.status(204).send();
  } catch (err) {
    console.error("Delete product error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// View all orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { name: true, email: true, phone: true, address: true } }, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update order status
router.put("/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status against enum
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    // Order IDs are UUIDs (strings), NOT integers
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(order);
  } catch (err) {
    console.error("Update order error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
