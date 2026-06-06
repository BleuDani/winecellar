import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GRAPES = [
  // Red
  "Cabernet Sauvignon",
  "Merlot",
  "Pinot Noir",
  "Syrah",
  "Grenache",
  "Tempranillo",
  "Sangiovese",
  "Nebbiolo",
  "Barbera",
  "Dolcetto",
  "Malbec",
  "Carménère",
  "Cabernet Franc",
  "Petit Verdot",
  "Zinfandel",
  "Mourvèdre",
  "Nero d'Avola",
  "Aglianico",
  "Montepulciano",
  "Corvina",
  "Primitivo",
  "Pinotage",
  "Touriga Nacional",
  "Tannat",
  "Gamay",
  // White
  "Chardonnay",
  "Sauvignon Blanc",
  "Riesling",
  "Pinot Gris",
  "Gewurztraminer",
  "Viognier",
  "Marsanne",
  "Roussanne",
  "Chenin Blanc",
  "Albariño",
  "Verdejo",
  "Assyrtiko",
  "Grüner Veltliner",
  "Torrontés",
  "Vermentino",
  "Fiano",
  "Greco",
  "Falanghina",
  "Verdicchio",
  "Sémillon",
  "Muscat Blanc",
  "Pinot Blanc",
  "Aligoté",
  "Trebbiano",
  "Muscadet",
];

async function seedGrapes() {
  console.log("Seeding grapes…");
  for (const name of GRAPES) {
    await prisma.grape.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ✓ ${GRAPES.length} grapes upserted`);
}

async function migrateWineGrapeStrings() {
  console.log("Migrating existing wine.grape strings to relations…");
  // This function is a no-op now that the grape string column has been removed.
  // It was used during the initial data migration; grape data now lives in WineGrape relations.
  const wines = await prisma.wine.findMany({
    where: { grapes: { none: {} } },
    include: { grapes: true },
  });

  console.log(`  ${wines.length} wine(s) have no grape relations (nothing to migrate).`);
}

async function main() {
  await seedGrapes();
  await migrateWineGrapeStrings();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
