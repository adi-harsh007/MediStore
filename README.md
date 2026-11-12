# MediStore

MediStore is a full-stack e-commerce web application for browsing and purchasing medicines and medical supplies. It provides a React + Vite storefront, an Express.js REST API, Prisma ORM backed by PostgreSQL (hosted on Supabase), role-based access control for customers and administrators, prescription uploads via Cloudinary, and payment processing via Razorpay.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Docker Setup](#docker-setup)
- [Deployment](#deployment)

---

## Tech Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 5
- **Authentication:** Google OAuth (`@react-oauth/google`)
- **State & Persistence:** React hooks with hash-based navigation and per-user `localStorage` cart persistence

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5
- **ORM:** Prisma ORM (`@prisma/client` / `prisma` v5)
- **Database:** PostgreSQL (hosted on Supabase; `postgres:16-alpine` for local Docker)
- **Authentication & Security:**
  - JSON Web Tokens (`jsonwebtoken`) for stateless session authentication
  - `bcrypt` for password hashing
  - `helmet` for HTTP security headers
  - `express-rate-limit` for auth, password change, and admin endpoint rate limiting
  - `cors` restricted to the configured frontend origin

### External Services
- **Payments:** Razorpay API with HMAC-SHA256 signature verification (falls back to direct pending orders when Razorpay keys are unconfigured)
- **Media Storage:** Cloudinary with `multer` and `multer-storage-cloudinary` for prescription uploads (`jpg`, `jpeg`, `png`, `pdf`, `webp`)
- **Email:** Nodemailer (Gmail SMTP) for 6-digit OTP email verification

### Infrastructure
- **Containerization:** Docker and Docker Compose
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render (`server/render.yaml`)

---

## Features

### Authentication and Account Management
- **Email/Password Registration & Login:** Validates input, hashes passwords with bcrypt, and enforces email verification before login.
- **OTP Email Verification:** Generates a 6-digit numeric OTP expiring in 10 minutes and delivers it via Nodemailer, with a rate-limited resend endpoint.
- **Google OAuth Login:** Verifies Google ID tokens server-side with `google-auth-library` and provisions or verifies matching accounts automatically.
- **Profile & Security:** Authenticated users can view and update their name, phone, and address, and change their password.

### Storefront and Shopping Experience
- **Catalog Browsing:** Backend-paginated product listing with case-insensitive search, category filtering, dynamic category counts, stock filtering, and sorting (`price-asc`, `price-desc`, `rating`, `discount`).
- **Product Details & Reviews:** Displays dosage, manufacturer, stock status, and user reviews. Only users who have purchased a product can submit a review (one review per user per product).
- **Wishlist & Cart:** Authenticated users can save products to a persistent database-backed wishlist and manage a per-user shopping cart.

### Orders, Prescriptions, and Payments
- **Prescription Upload:** Secure upload endpoint backed by Cloudinary CDN for orders requiring prescriptions.
- **Server-Side Order Integrity:** Order totals are computed strictly on the server from database product prices, stock is verified and decremented before order creation, and Razorpay signatures are verified via HMAC-SHA256.
- **Order History:** Customers can track their past orders and item breakdowns.

### Admin Dashboard
- **Product Management:** Create, update, and soft-delete products (`isActive: false`, `inStock: false`, `stock: 0`).
- **Order Management:** View all customer orders with user contact details and update order statuses across `PENDING`, `PROCESSING`, `PAID`, `SHIPPED`, `DELIVERED`, and `CANCELLED`.

---

## Project Structure

```text
medistore/
├── .env.example                 # Frontend environment variable template
├── Dockerfile                   # Frontend production container
├── docker-compose.yml           # Multi-container setup (frontend, backend, postgres)
├── index.html                   # Vite entry HTML
├── package.json                 # Frontend dependencies and scripts
├── vite.config.js               # Vite configuration
├── src/
│   ├── App.jsx                  # Root application state, routing, and toast notifications
│   ├── medistore.jsx            # Application bootstrap
│   ├── components/              # Navbar, ProductCard, Discount, StarRating
│   ├── pages/                   # Home, Listing, Detail, Cart, Auth, Profile, MyOrders, Wishlist, Admin
│   └── utils/theme.js           # Shared styling tokens and API base configuration
└── server/
    ├── .env.example             # Backend environment variable template
    ├── Dockerfile               # Backend production container
    ├── index.js                 # Express app setup and route mounting
    ├── emailService.js          # Nodemailer OTP verification email sender
    ├── prismaClient.js          # Shared PrismaClient singleton
    ├── render.yaml              # Render web service blueprint
    ├── package.json             # Backend dependencies and scripts
    ├── middleware/
    │   └── authMiddleware.js    # JWT verification and admin role guard
    ├── prisma/
    │   ├── schema.prisma        # PostgreSQL data model
    │   └── seed.js              # Admin user and initial product catalog seeder
    └── routes/
        ├── authRoutes.js        # /api/auth/*
        ├── productRoutes.js     # /api/products/*
        ├── orderRoutes.js       # /api/orders/*
        ├── userRoutes.js        # /api/user/*
        └── adminRoutes.js       # /api/admin/*
```

---

## Database Schema

Defined in `server/prisma/schema.prisma` for PostgreSQL:

- **`User`**: Stores account credentials (`id`, `name`, `email`, `passwordHash`), contact details (`phone`, `address`), verification state (`emailVerified`, `verificationCode`, `codeExpiry`), and `role` (`USER` | `ADMIN`).
- **`Product`**: Stores catalog metadata (`name`, `category`, `price`, `originalPrice`, `icon`, `color`, `description`, `dosage`, `manufacturer`), inventory (`inStock`, `stock`, `isActive`), and `prescriptionRequired`.
- **`Review`**: Stores 1-5 ratings and comments linked to `User` and `Product`.
- **`Wishlist`**: Maps unique `(userId, productId)` pairs for saved items.
- **`Order`**: Tracks order `totalAmount`, `status` (`PENDING`, `PROCESSING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`), optional `paymentId`, and optional `prescriptionUrl`.
- **`OrderItem`**: Line items linking `Order` and `Product` with `quantity` and `priceAtTime`.

---

## API Endpoints

| Prefix | Purpose | Access |
| :--- | :--- | :--- |
| `/api/auth` | Signup, email OTP verification, resend OTP, login, Google OAuth login | Public (rate-limited) |
| `/api/products` | Paginated product search/filter, category counts, product details, submit review | Public (`POST` review requires auth) |
| `/api/orders` | Prescription upload, order creation, Razorpay verification, user order history | Authenticated |
| `/api/user` | Profile read/update, password change, wishlist CRUD | Authenticated |
| `/api/admin` | Product CRUD and soft-delete, view all orders, update order status | Admin (`ADMIN` role, rate-limited) |

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- A Supabase project (or a local PostgreSQL 16+ instance)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd medistore
```

### 2. Configure Frontend

```bash
npm install
cp .env.example .env
```

Set `VITE_GOOGLE_CLIENT_ID` in `.env` if using Google OAuth.

### 3. Configure Backend and Database

```bash
cd server
npm install
cp .env.example .env
```

Update `server/.env` with your credentials:
- `DATABASE_URL`: Your Supabase PostgreSQL Session Pooler URI (`postgresql://postgres.<ref>:<password>@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`)
- `JWT_SECRET`: Strong secret key for signing JWTs
- `FRONTEND_URL`: Frontend origin allowed by CORS (default `http://localhost:5173`)
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: Optional; if omitted or left as placeholder, checkout creates direct pending orders
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Required for prescription file uploads
- `GOOGLE_CLIENT_ID`: Required for Google OAuth verification
- `SMTP_USER` and `SMTP_PASS`: Gmail address and App Password for OTP emails
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: Optional overrides used by `prisma/seed.js`

### 4. Push Schema and Seed Data

```bash
cd server
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Run Locally

Start the backend server (from `server/`):

```bash
npm run dev
```

Start the frontend development server (from project root):

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and the API runs on `http://localhost:5000`.

---

## Docker Setup

To run the frontend, backend, and a local PostgreSQL 16 database together using Docker Compose:

```bash
docker compose up --build
```

This starts:
- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:5000`
- **PostgreSQL:** `localhost:5432` (database `medistore`)

---

## Deployment

- **Database:** Hosted on Supabase PostgreSQL. Use the **Session Pooler** connection string (port `5432`) for IPv4 compatibility on platforms like Render.
- **Backend (Render):** Configured via `server/render.yaml` (`buildCommand: npm install && npx prisma generate`, `startCommand: node index.js`). Configure all environment variables from `server/.env.example` in the Render dashboard.
- **Frontend (Vercel):** Deploy the root Vite application and configure `VITE_GOOGLE_CLIENT_ID` and the production API URL as needed.
