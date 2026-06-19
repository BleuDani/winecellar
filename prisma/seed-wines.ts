import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const supabase = createClient(
  "https://monypzyylmjdlfrfrpvx.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  {
    producer: "Screaming Eagle",
    name: "Cabernet Sauvignon",
    vintage: 2018,
    region: "Oakville, Napa Valley",
    grape: "Cabernet Sauvignon",
    notes:
      "California's most coveted cult wine. Intensely concentrated cassis, violets, and dark chocolate with impossibly silky tannins. Mailing list only.",
    labelSeed: 70,
  },
  {
    producer: "Domaine de la Romanée-Conti",
    name: "Romanée-Conti Grand Cru",
    vintage: 2014,
    region: "Vosne-Romanée, Burgundy",
    grape: "Pinot Noir",
    notes:
      "The most celebrated wine in the world. A 1.8-hectare monopole. Rose petals, red cherry, forest floor, and unrivalled complexity that evolves for decades.",
    labelSeed: 80,
  },
  {
    producer: "Château Margaux",
    name: "Château Margaux",
    vintage: 2016,
    region: "Margaux, Bordeaux",
    grape: "Cabernet Sauvignon / Merlot / Petit Verdot",
    notes:
      "First Growth icon with floral elegance rare in Bordeaux. Violet, blackcurrant, and cedar with exceptional silkiness and a 50-year horizon.",
    labelSeed: 90,
  },
  {
    producer: "Antinori",
    name: "Solaia",
    vintage: 2017,
    region: "Tuscany",
    grape: "Cabernet Sauvignon / Sangiovese / Cabernet Franc",
    notes:
      "The Antinori family's flagship Super Tuscan. Ripe plum, blackberry, and espresso with a distinctive Sangiovese freshness. One of Italy's finest.",
    labelSeed: 100,
  },
  {
    producer: "Ridge Vineyards",
    name: "Monte Bello",
    vintage: 2019,
    region: "Santa Cruz Mountains",
    grape: "Cabernet Sauvignon / Merlot / Petit Verdot",
    notes:
      "California's greatest food wine. Austere and European in style — firm acidity, mountain mineral character, dark fruit, and 20+ year aging potential.",
    labelSeed: 110,
  },
  {
    producer: "Álvaro Palacios",
    name: "L'Ermita",
    vintage: 2020,
    region: "Priorat",
    grape: "Garnacha / Cabernet Sauvignon",
    notes:
      "Old Garnacha vines on llicorella slate. Intensely mineral, with dark fruit, licorice, and a saline finish. Transformed Spain's perception of fine wine.",
    labelSeed: 120,
  },
  {
    producer: "Egon Müller",
    name: "Scharzhofberger Riesling Spätlese",
    vintage: 2021,
    region: "Mosel",
    grape: "Riesling",
    notes:
      "Germany's greatest estate on steep slate slopes. Crystalline peach, apricot, and lime zest carried by razor acidity and barely 8% alcohol. Ageable for 30+ years.",
    labelSeed: 130,
  },
  {
    producer: "Ruinart",
    name: "Blanc de Blancs",
    vintage: 2015,
    region: "Champagne",
    grape: "Chardonnay",
    notes:
      "The oldest Champagne house's prestige cuvée. Pure Chardonnay from Côte des Blancs with brioche, green apple, lemon curd, and an endlessly fine mousse.",
    labelSeed: 140,
  },
  {
    producer: "Catena Zapata",
    name: "Adrianna Vineyard Malbec",
    vintage: 2020,
    region: "Gualtallary, Mendoza",
    grape: "Malbec",
    notes:
      "Argentina's answer to the world's great reds. High-altitude Malbec at 1,450m. Violet, blackberry, graphite, and a savory minerality that sets it apart.",
    labelSeed: 150,
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
  // Screaming Eagle
  { wineIdx: 6, cellarIdx: 0, qty: 2, bin: "Row A, Shelf 1", price: 3800, drinkFrom: 2026, drinkTo: 2042 },
  // Romanée-Conti
  { wineIdx: 7, cellarIdx: 0, qty: 1, bin: "Row D, Shelf 2", price: 22000, drinkFrom: 2030, drinkTo: 2060 },
  { wineIdx: 7, cellarIdx: 1, qty: 1, bin: "Cabinet A", price: 22000, drinkFrom: 2030, drinkTo: 2060 },
  // Château Margaux
  { wineIdx: 8, cellarIdx: 0, qty: 4, bin: "Row B, Shelf 2", price: 1100, drinkFrom: 2026, drinkTo: 2050 },
  { wineIdx: 8, cellarIdx: 1, qty: 2, bin: "Cabinet B", price: 1100, drinkFrom: 2026, drinkTo: 2050 },
  // Solaia
  { wineIdx: 9, cellarIdx: 1, qty: 3, bin: "Rack 1, Shelf 2", price: 320, drinkFrom: 2025, drinkTo: 2040 },
  // Ridge Monte Bello
  { wineIdx: 10, cellarIdx: 0, qty: 6, bin: "Row C, Shelf 2", price: 280, drinkFrom: 2025, drinkTo: 2045 },
  // L'Ermita
  { wineIdx: 11, cellarIdx: 1, qty: 2, bin: "Rack 2, Shelf 1", price: 850, drinkFrom: 2026, drinkTo: 2040 },
  // Egon Müller Riesling
  { wineIdx: 12, cellarIdx: 0, qty: 4, bin: "Row E, Shelf 1", price: 190, drinkFrom: 2024, drinkTo: 2050 },
  { wineIdx: 12, cellarIdx: 1, qty: 3, bin: "Cabinet C", price: 190, drinkFrom: 2024, drinkTo: 2050 },
  // Ruinart Blanc de Blancs
  { wineIdx: 13, cellarIdx: 1, qty: 6, bin: "Rack 3, Shelf 1", price: 210, drinkFrom: 2024, drinkTo: 2032 },
  // Catena Zapata
  { wineIdx: 14, cellarIdx: 0, qty: 5, bin: "Row C, Shelf 3", price: 150, drinkFrom: 2024, drinkTo: 2038 },
  { wineIdx: 14, cellarIdx: 1, qty: 3, bin: "Rack 1, Shelf 3", price: 150, drinkFrom: 2024, drinkTo: 2038 },
];

async function uploadLabel(seed: number, wineId: string): Promise<string | null> {
  const url = `https://picsum.photos/seed/${seed}/160/224`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch label: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = `${wineId}.jpg`;
  const { error } = await supabase.storage.from("wine-labels").upload(filename, buf, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data: { publicUrl } } = supabase.storage.from("wine-labels").getPublicUrl(filename);
  return publicUrl;
}

async function main() {
  const cellars = await prisma.cellar.findMany({ orderBy: { createdAt: "asc" } });
  if (cellars.length < 2) {
    throw new Error("Run the main seed first: npx tsx prisma/seed.ts");
  }

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

    // upload label image to Supabase Storage
    try {
      console.log(`Uploading label for ${w.name}…`);
      const publicUrl = await uploadLabel(w.labelSeed, wine.id);
      await prisma.wine.update({ where: { id: wine.id }, data: { labelImage: publicUrl } });
      console.log(`  ✓ label uploaded`);
    } catch (e) {
      console.warn(`  ✗ label upload failed: ${e}`);
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
