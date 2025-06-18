-- CreateTable
CREATE TABLE "SpotCheckItem" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "SpotCheckItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SpotCheckItem" ADD CONSTRAINT "SpotCheckItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotCheckItem" ADD CONSTRAINT "SpotCheckItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
