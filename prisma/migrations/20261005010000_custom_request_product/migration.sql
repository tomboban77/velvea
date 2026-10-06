-- AlterTable
ALTER TABLE "CustomBasketRequest" ADD COLUMN     "productId" TEXT,
ADD COLUMN     "productName" TEXT,
ADD COLUMN     "productPriceCents" INTEGER;

-- AddForeignKey
ALTER TABLE "CustomBasketRequest" ADD CONSTRAINT "CustomBasketRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

