-- CreateTable
CREATE TABLE "Cellar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Wine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "producer" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vintage" INTEGER,
    "region" TEXT,
    "grape" TEXT,
    "vivinoUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StockItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "cellarId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "purchasePrice" REAL,
    "binLocation" TEXT,
    "drinkFrom" INTEGER,
    "drinkUntil" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StockItem_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StockItem_cellarId_fkey" FOREIGN KEY ("cellarId") REFERENCES "Cellar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VivinoData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "score" REAL,
    "reviewCount" INTEGER,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VivinoData_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VivinoData_wineId_key" ON "VivinoData"("wineId");
