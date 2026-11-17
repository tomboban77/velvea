-- Manually entered profit per order and per custom basket request.
-- Nullable with no default: null means "not entered yet".

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "profitCents" INTEGER;

-- AlterTable
ALTER TABLE "CustomBasketRequest" ADD COLUMN "profitCents" INTEGER;
