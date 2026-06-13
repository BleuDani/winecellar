-- AlterTable
ALTER TABLE "Cellar" ADD COLUMN     "userId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "VivinoData" ADD COLUMN     "description" TEXT,
ADD COLUMN     "foodPairings" TEXT,
ADD COLUMN     "wineStyle" TEXT;

-- AlterTable
ALTER TABLE "Wine" ADD COLUMN     "userId" TEXT NOT NULL DEFAULT '';
