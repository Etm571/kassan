-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imagePath" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_key" ON "Item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_barcode_key" ON "Item"("barcode");
