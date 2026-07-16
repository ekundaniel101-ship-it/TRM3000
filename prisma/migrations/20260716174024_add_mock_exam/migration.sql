-- AlterEnum
ALTER TYPE "TestType" ADD VALUE 'MOCK';

-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "objectivePoints" DOUBLE PRECISION,
ADD COLUMN     "theoryPoints" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "maxObjective" DOUBLE PRECISION,
ADD COLUMN     "maxTheory" DOUBLE PRECISION;
