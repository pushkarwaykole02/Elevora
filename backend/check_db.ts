import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const userId = "38dd13da-f896-4065-afb0-d28502c99d33";
  console.log(`Running dashboard query simulation for userId: ${userId}`);
  
  try {
    // 1. Check if user exists
    console.log("1. Finding user...");
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    console.log("User result:", user);

    if (!user) {
      console.log("User not found in database.");
      return;
    }

    // 2. Fetch all sessions
    console.log("2. Fetching sessions...");
    const sessions = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Sessions count:", sessions.length);

  } catch (error: any) {
    console.error("❌ QUERY FAILED WITH ERROR:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
