const express = require("express");
const prisma = require("../prismaClient");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all products (with pagination)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // 12 per page by default
    const skip = (page - 1) * limit;

    const { search, category, rxFilter, inStockFilter, sort } = req.query;

    const where = { isActive: true };
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (category && category !== "All") {
      where.category = category;
    }
    if (rxFilter === "true") {
      where.prescription = true;
    }
    if (inStockFilter === "true") {
      where.inStock = true;
    }

    const products = await prisma.product.findMany({ 
      where,
      include: {
        reviews: { select: { rating: true } }
      }
    });

    let formattedProducts = products.map(p => {
      const reviewCount = p.reviews.length;
      const avgRating = reviewCount > 0 ? (p.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1) : 0;
      const { reviews, ...rest } = p;
      return { ...rest, rating: Number(avgRating), reviews: reviewCount };
    });

    // Sort in memory for complex computed fields
    if (sort === "price-asc") formattedProducts.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") formattedProducts.sort((a, b) => b.price - a.price);
    else if (sort === "rating") formattedProducts.sort((a, b) => b.rating - a.rating);
    else if (sort === "discount") formattedProducts.sort((a, b) => ((1 - a.price / a.originalPrice) - (1 - b.price / b.originalPrice)) * -1);

    const total = formattedProducts.length;
    const paginatedProducts = formattedProducts.slice(skip, skip + limit);

    res.json({
      products: paginatedProducts,
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
      include: {
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    const reviewCount = product.reviews.length;
    const avgRating = reviewCount > 0 ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1) : 0;
    
    const { reviews, ...rest } = product;

    res.json({
      ...rest,
      rating: Number(avgRating),
      reviews: reviewCount,
      reviewList: reviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Post a review
router.post("/:id/reviews", authMiddleware, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if user has purchased this product
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId }
      }
    });

    if (!orderItem) {
      return res.status(403).json({ error: "You can only review products you have purchased." });
    }

    // Check if review already exists
    const existing = await prisma.review.findFirst({
      where: { productId, userId }
    });

    if (existing) {
      return res.status(400).json({ error: "You have already reviewed this product." });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || "",
        userId,
        productId
      },
      include: {
        user: { select: { name: true } }
      }
    });

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
