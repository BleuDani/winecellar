import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.cellar.count();
  if (count > 0) {
    console.log("Cellars already seeded, skipping.");
    return;
  }
  await prisma.cellar.create({ data: { name: "Main Cellar", location: "Basement" } });
  await prisma.cellar.create({ data: { name: "Secondary Cellar", location: "Garage" } });
  console.log("Seeded 2 cellars.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
