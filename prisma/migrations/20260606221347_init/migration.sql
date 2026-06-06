-- CreateTable
CREATE TABLE "Cellar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cellar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wine" (
    "id" TEXT NOT NULL,
    "producer" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vintage" INTEGER,
    "region" TEXT,
    "country" TEXT,
    "vivinoUrl" TEXT,
    "notes" TEXT,
    "labelImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grape" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Grape_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WineGrape" (
    "wineId" TEXT NOT NULL,
    "grapeId" TEXT NOT NULL,

    CONSTRAINT "WineGrape_pkey" PRIMARY KEY ("wineId","grapeId")
);

-- CreateTable
CREATE TABLE "StockItem" (
    "id" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "cellarId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "purchasePrice" DOUBLE PRECISION,
    "binLocation" TEXT,
    "drinkFrom" INTEGER,
    "drinkUntil" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VivinoData" (
    "id" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VivinoData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grape_name_key" ON "Grape"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VivinoData_wineId_key" ON "VivinoData"("wineId");

-- AddForeignKey
ALTER TABLE "WineGrape" ADD CONSTRAINT "WineGrape_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WineGrape" ADD CONSTRAINT "WineGrape_grapeId_fkey" FOREIGN KEY ("grapeId") REFERENCES "Grape"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_cellarId_fkey" FOREIGN KEY ("cellarId") REFERENCES "Cellar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VivinoData" ADD CONSTRAINT "VivinoData_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
