const { PrismaClient } = require("@prisma/client");

// Single shared PrismaClient instance to avoid multiple connection pools
const prisma = new PrismaClient();

module.exports = prisma;
