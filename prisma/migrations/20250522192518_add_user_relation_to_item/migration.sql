/*
  Warnings:

  - Added the required column `userId` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Item_name_key";

-- AlterTable

ALTER TABLE "Item" ADD COLUMN "userId" INTEGER;

UPDATE "Item" SET "userId" = 1 WHERE "userId" IS NULL;

ALTER TABLE "Item" ALTER COLUMN "userId" SET NOT NULL;


-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
