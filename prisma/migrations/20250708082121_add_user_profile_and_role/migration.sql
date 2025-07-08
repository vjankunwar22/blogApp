-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BLOGGER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'BLOGGER';
