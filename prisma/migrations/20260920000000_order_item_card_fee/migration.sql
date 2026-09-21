-- Premium greeting card upgrade, charged per basket.
-- Defaults to 0 so every existing order line reads as the free Velvea card.
ALTER TABLE "OrderItem" ADD COLUMN "cardFeeCents" INTEGER NOT NULL DEFAULT 0;
