-- AlterTable
ALTER TABLE "Wine" ADD COLUMN "country" TEXT;

-- CreateTable
CREATE TABLE "Grape" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WineGrape" (
    "wineId" TEXT NOT NULL,
    "grapeId" TEXT NOT NULL,

    PRIMARY KEY ("wineId", "grapeId"),
    CONSTRAINT "WineGrape_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WineGrape_grapeId_fkey" FOREIGN KEY ("grapeId") REFERENCES "Grape" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Grape_name_key" ON "Grape"("name");
