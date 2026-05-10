const express = require("express");
const prisma = require("../prismaClient");

const router = express.Router();

// Get all products (with pagination)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // 12 per page by default
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({ skip, take: limit }),
      prisma.product.count()
    ]);

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get category counts (dynamic from DB)
router.get("/categories", async (req, res) => {
  try {
    const counts = await prisma.product.groupBy({
      by: ["category"],
      _count: { id: true },
      where: { isActive: true },
    });

    const categories = counts.map(c => ({
      name: c.category,
      count: c._count.id,
    }));

    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
