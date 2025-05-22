-- AlterTable
ALTER TABLE "User" ADD COLUMN     "token" TEXT,
ADD COLUMN     "tokenExpiry" TIMESTAMP(3);
