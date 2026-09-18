-- Per-item gift card messages.
-- Nullable: existing order lines keep falling back to Order."giftMessage".
ALTER TABLE "OrderItem" ADD COLUMN "giftMessage" TEXT;
