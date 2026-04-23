import { prisma } from "../src/lib/prisma";
import { seedSeniorSecondaryAndImpactUniCurriculum } from "../src/lib/venture-lab-seed";

async function main() {
  console.log("🌱 Seeding Senior Secondary and ImpactUni curriculum...");
  const summary = await seedSeniorSecondaryAndImpactUniCurriculum(prisma);
  console.log("✅ Venture curriculum seeded", summary);
}

main()
  .catch((error) => {
    console.error("❌ Venture curriculum seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });