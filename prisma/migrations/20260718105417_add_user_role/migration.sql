-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'TEACHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'TEACHER';
