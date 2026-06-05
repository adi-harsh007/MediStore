# MediStore - Full-Stack E-Commerce Platform

A production-grade, full-stack e-commerce platform designed for purchasing medical supplies and medicines. Built with a modern tech stack, ensuring high performance, security, and scalability.

## Tech Stack

### Frontend
* **Library:** React.js
* **Build Tool:** Vite (for fast, optimized bundling)
* **Authentication:** Google OAuth (`@react-oauth/google`)
* **Styling:** Modern CSS (Custom styled with responsive layouts)

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database ORM:** Prisma ORM
* **Database:** MySQL (Hosted on Aiven for database isolation)
* **Authentication & Security:** 
  * JSON Web Tokens (JWT) for secure session management
  * Bcrypt for password hashing
  * Helmet for securing HTTP headers
  * Express Rate Limit for preventing brute-force attacks
  * CORS for cross-origin resource sharing

### External Integrations & Cloud Services
* **Payment Gateway:** Razorpay API for secure and seamless checkout
* **Media Storage:** Cloudinary (integrated with Multer for handling file uploads like prescriptions)
* **Email Services:** Nodemailer & Gmail SMTP for automated email delivery (OTP, Order confirmations)

### Infrastructure & Deployment
* **Containerization:** Docker & Docker Compose
* **Frontend Deployment:** Vercel
* **Backend Deployment:** Render

---

## Key Features

### 1. Robust Authentication & Security
* **Multi-Strategy Login:** Supports standard email/password registration alongside Google OAuth integration.
* **OTP-Based Email Verification:** Real-time email verification using Nodemailer to prevent fake account registrations.
* **Role-Based Access Control (RBAC):** Distinct workflows for regular users and administrators.

### 2. Advanced E-Commerce Capabilities
* **Optimized Product Browsing:** Implemented backend pagination to handle large product catalogs efficiently.
* **Secure Checkout Flow:** Integrated Razorpay for processing UPI and card payments, capturing essential delivery details (address, phone number) smoothly.
* **Dynamic Order Receipts:** Users receive immediate, transparent order receipts prior to final payment.

### 3. Medical-Specific Functionality
* **Prescription Upload System:** A mandatory, secure file upload feature for restricted medicines utilizing `multer` and Cloudinary, allowing admins to verify prescriptions.

### 4. Comprehensive Admin Dashboard
* **Order Management Workflow:** Dedicated admin panel to view detailed order information.
* **Status Tracking:** Automated and manual order status updates (e.g., setting new orders to 'Pending' for administrative review).

### 5. Modern UI/UX
* **Interactive Notifications:** Replaced standard browser alerts with a sophisticated, typed toast notification system for better user feedback on actions (success, error, loading states).
