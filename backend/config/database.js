// ═══════════════════════════════════════════════════════
//  Vimbiso AgriLink — Supabase (PostgreSQL) connection
//  Using Prisma ORM for type-safe DB access
// ═══════════════════════════════════════════════════════
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query','error'] : ['error'],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Supabase PostgreSQL connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
