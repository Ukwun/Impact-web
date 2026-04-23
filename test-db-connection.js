import { PrismaClient } from "@prisma/client";

const databaseUrl = "postgresql://impactapp_db_user:9Ij4NzldtvyLpURiNzULcJ2mVURjvYCc@dpg-d6mv5tp4tr6s738nigv0-a.oregon-postgres.render.com/impactapp_db";

console.log("Testing database connection...");
console.log("DATABASE_URL:", databaseUrl);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function test() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ping`;
    console.log("✅ Database connection successful:", result);
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
