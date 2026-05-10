require('dotenv').config();
const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');

const PRODUCTS = [
  { name: "Paracetamol 500mg", category: "Pain Relief", price: 45, originalPrice: 65, rating: 4.8, reviews: 2340, icon: "💊", color: "#FEF3C7", description: "Fast-acting pain reliever and fever reducer.", dosage: "1–2 tablets every 4–6 hours (max 8/day)", prescriptionRequired: false, inStock: true, manufacturer: "Sun Pharma" },
  { name: "Vitamin C 1000mg", category: "Vitamins", price: 299, originalPrice: 399, rating: 4.9, reviews: 1876, icon: "🍊", color: "#FFF7ED", description: "High-strength Vitamin C for immune support.", dosage: "1 tablet daily after meals", prescriptionRequired: false, inStock: true, manufacturer: "HealthKart" },
  { name: "Amoxicillin 500mg", category: "Antibiotics", price: 189, originalPrice: 240, rating: 4.6, reviews: 892, icon: "💉", color: "#EFF6FF", description: "Broad-spectrum antibiotic.", dosage: "1 capsule 3 times daily for 7 days", prescriptionRequired: true, inStock: true, manufacturer: "Cipla" },
  { name: "Omeprazole 20mg", category: "Digestive", price: 125, originalPrice: 160, rating: 4.7, reviews: 1203, icon: "🫁", color: "#F0FDF4", description: "Proton pump inhibitor for acid reflux.", dosage: "1 capsule daily before breakfast", prescriptionRequired: false, inStock: true, manufacturer: "Dr. Reddy's" },
];


async function main() {
  console.log('Seeding database...');
  
  // Read admin credentials from .env
  const adminName = process.env.ADMIN_NAME || 'Admin User';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@medistore.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  // Create admin user
  const adminPassword = await bcrypt.hash(adminPass, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log({ admin });

  // Create products
  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: p
    });
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
