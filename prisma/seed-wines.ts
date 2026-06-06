import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

const wines = [
  {
    producer: "Château Pétrus",
    name: "Pétrus",
    vintage: 2015,
    region: "Pomerol",
    grape: "Merlot",
    notes:
      "Legendary Pomerol estate. Dense, velvety texture with black truffle, plum, and cedar. One of Bordeaux's most coveted bottles.",
    labelSeed: 10,
  },
  {
    producer: "Opus One Winery",
    name: "Opus One",
    vintage: 2019,
    region: "Napa Valley",
    grape: "Cabernet Sauvignon",
    notes:
      "The Mondavi-Rothschild joint venture. Elegant and structured with black currant, graphite, and dried herbs. Exceptional aging potential.",
    labelSeed: 20,
  },
  {
    producer: "Tenuta San Guido",
    name: "Sassicaia",
    vintage: 2018,
    region: "Bolgheri",
    grape: "Cabernet Sauvignon / Cabernet Franc",
    notes:
      "The original Super Tuscan. Firm tannins with cassis, tobacco, and a long mineral finish. Benchmark of Italian fine wine.",
    labelSeed: 30,
  },
  {
    producer: "Penfolds",
    name: "Grange",
    vintage: 2017,
    region: "South Australia",
    grape: "Shiraz",
    notes:
      "Australia's most iconic wine. Multi-regional Shiraz with concentrated dark fruit, chocolate, leather, and remarkable longevity.",
    labelSeed: 40,
  },
  {
    producer: "Domaine Leroy",
    name: "Musigny Grand Cru",
    vintage: 2016,
    region: "Burgundy",
    grape: "Pinot Noir",
    notes:
      "Lalou Bize-Leroy's masterpiece. Biodynamic farming, infinitesimal yields. Pure, translucent, ethereal Pinot with extraordinary finesse.",
    labelSeed: 50,
  },
  {
    producer: "Vega Sicilia",
    name: "Único",
    vintage: 2011,
    region: "Ribera del Duero",
    grape: "Tempranillo / Cabernet Sauvignon",
    notes:
      "Spain's most prestigious wine, aged for 10+ years before release. Complex layers of dried fruit, vanilla, tobacco, and earthy notes.",
    labelSeed: 60,
  },
];

const stockAllocations: {
  wineIdx: number;
  cellarIdx: number; // 0 = Boa Vista, 1 = The Place
  qty: number;
  bin: string;
  price: number;
  drinkFrom?: number;
  drinkTo?: number;
}[] = [
  { wineIdx: 0, cellarIdx: 0, qty: 3, bin: "Row B, Shelf 1", price: 2800, drinkFrom: 2026, drinkTo: 2040 },
  { wineIdx: 0, cellarIdx: 1, qty: 1, bin: "Cabinet A", price: 2800, drinkFrom: 2026, drinkTo: 2040 },
  { wineIdx: 1, cellarIdx: 0, qty: 6, bin: "Row A, Shelf 2", price: 420, drinkFrom: 2025, drinkTo: 2035 },
  { wineIdx: 2, cellarIdx: 0, qty: 4, bin: "Row C, Shelf 1", price: 380, drinkFrom: 2024, drinkTo: 2038 },
  { wineIdx: 2, cellarIdx: 1, qty: 2, bin: "Cabinet B", price: 380, drinkFrom: 2024, drinkTo: 2038 },
  { wineIdx: 3, cellarIdx: 1, qty: 5, bin: "Rack 2, Shelf 3", price: 900, drinkFrom: 2025, drinkTo: 2045 },
  { wineIdx: 4, cellarIdx: 0, qty: 2, bin: "Row D, Shelf 1", price: 4500, drinkFrom: 2028, drinkTo: 2055 },
  { wineIdx: 5, cellarIdx: 1, qty: 3, bin: "Cabinet C", price: 650, drinkFrom: 2026, drinkTo: 2045 },
  { wineIdx: 5, cellarIdx: 0, qty: 1, bin: "Row B, Shelf 3", price: 650, drinkFrom: 2026, drinkTo: 2045 },
];

async function downloadLabel(seed: number, filePath: string) {
  const url = `https://picsum.photos/seed/${seed}/160/224`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch label: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(filePath, buf);
}

async function main() {
  const cellars = await prisma.cellar.findMany({ orderBy: { createdAt: "asc" } });
  if (cellars.length < 2) {
    throw new Error("Run the main seed first: npx tsx prisma/seed.ts");
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const createdWines: { id: string }[] = [];

  for (const w of wines) {
    const existing = await prisma.wine.findFirst({
      where: { producer: w.producer, name: w.name },
    });
    if (existing) {
      console.log(`Skipping existing: ${w.producer} ${w.name}`);
      createdWines.push(existing);
      continue;
    }

    const wine = await prisma.wine.create({
      data: {
        producer: w.producer,
        name: w.name,
        vintage: w.vintage,
        region: w.region,
        notes: w.notes,
      },
    });

    // connect grape relations
    const grapeNames = w.grape.split(/\s*\/\s*|\s*,\s*/).map((s: string) => s.trim()).filter(Boolean);
    for (const grapeName of grapeNames) {
      const grape = await prisma.grape.upsert({
        where: { name: grapeName },
        update: {},
        create: { name: grapeName },
      });
      await prisma.wineGrape.upsert({
        where: { wineId_grapeId: { wineId: wine.id, grapeId: grape.id } },
        update: {},
        create: { wineId: wine.id, grapeId: grape.id },
      });
    }

    // download label image
    const labelPath = path.join(uploadsDir, `${wine.id}.jpg`);
    try {
      console.log(`Downloading label for ${w.name}…`);
      await downloadLabel(w.labelSeed, labelPath);
      await prisma.wine.update({
        where: { id: wine.id },
        data: { labelImage: `/uploads/${wine.id}.jpg` },
      });
      console.log(`  ✓ label saved`);
    } catch (e) {
      console.warn(`  ✗ label download failed: ${e}`);
    }

    createdWines.push(wine);
  }

  for (const alloc of stockAllocations) {
    const wine = createdWines[alloc.wineIdx];
    const cellar = cellars[alloc.cellarIdx];
    if (!wine || !cellar) continue;

    const existing = await prisma.stockItem.findFirst({
      where: { wineId: wine.id, cellarId: cellar.id },
    });
    if (existing) {
      console.log(`Stock already exists for ${wines[alloc.wineIdx].name} in ${cellar.name}`);
      continue;
    }

    await prisma.stockItem.create({
      data: {
        wineId: wine.id,
        cellarId: cellar.id,
        quantity: alloc.qty,
        binLocation: alloc.bin,
        purchasePrice: alloc.price,
        drinkFrom: alloc.drinkFrom,
        drinkUntil: alloc.drinkTo,
      },
    });
    console.log(`  Added ${alloc.qty} bottles of ${wines[alloc.wineIdx].name} → ${cellar.name}`);
  }

  console.log("\nDone.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
