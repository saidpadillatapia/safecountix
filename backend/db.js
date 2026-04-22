const { PrismaClient } = require('@prisma/client');

// Singleton PrismaClient instance — connects using DATABASE_URL from prisma.config.js
const prisma = new PrismaClient();

module.exports = prisma;
