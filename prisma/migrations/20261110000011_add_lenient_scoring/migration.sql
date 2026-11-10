-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "lenientCorrect" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Run" ADD COLUMN     "lenientAccuracy" DOUBLE PRECISION;
