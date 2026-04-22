const { defineConfig } = require("prisma/config");

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    // Use DATABASE_URL if available, fallback to dummy for build-time prisma generate
    url: process.env.DATABASE_URL || "mysql://placeholder:placeholder@localhost:3306/placeholder",
  },
});
