/*
  Warnings:

  - You are about to drop the `SpotCheckItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SpotCheckItem" DROP CONSTRAINT "SpotCheckItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "SpotCheckItem" DROP CONSTRAINT "SpotCheckItem_userId_fkey";

-- DropTable
DROP TABLE "SpotCheckItem";
