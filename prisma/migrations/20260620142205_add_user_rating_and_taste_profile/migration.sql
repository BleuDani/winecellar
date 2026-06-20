-- AlterTable
ALTER TABLE "VivinoData" ADD COLUMN     "flavorNotes" TEXT,
ADD COLUMN     "tasteAcidity" DOUBLE PRECISION,
ADD COLUMN     "tasteBody" DOUBLE PRECISION,
ADD COLUMN     "tasteFizziness" DOUBLE PRECISION,
ADD COLUMN     "tasteSweetness" DOUBLE PRECISION,
ADD COLUMN     "tasteTannins" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Wine" ADD COLUMN     "userRating" DOUBLE PRECISION;
