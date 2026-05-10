const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");

dotenv.config();

// Crash early if critical env vars are missing
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set in .env file. Server cannot start.");
  process.exit(1);
}

const app = express();

// Security headers (X-Frame-Options, CSP, HSTS, etc.)
// Disable CORP so frontend can load images from /uploads
app.use(helmet({ crossOriginResourcePolicy: false }));

// Restrict CORS to frontend origin only
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Limit request body size to prevent DoS
app.use(express.json({ limit: "10kb" }));

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// Prescription uploads served via Cloudinary CDN (no local storage needed)

app.get("/", (req, res) => {
  res.send("MediStore API is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
