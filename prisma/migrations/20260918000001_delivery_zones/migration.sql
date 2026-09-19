-- Delivery zones: destinations are routed by postal code (FSA) instead of by
-- the city name a customer typed, and every rate belongs to the zone that
-- charges it rather than to one global set of flat fees.

CREATE TYPE "ZoneKind" AS ENUM ('PICKUP', 'LOCAL', 'SHIPPING', 'QUOTE', 'BLOCKED');

CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "kind" "ZoneKind" NOT NULL,
    "fsaPrefixes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fsaLetters" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "provinces" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "baseFeeCents" INTEGER NOT NULL DEFAULT 0,
    "extraItemCents" INTEGER NOT NULL DEFAULT 0,
    "sameDaySurchargeCents" INTEGER NOT NULL DEFAULT 0,
    "freeThresholdCents" INTEGER,
    "sameDayCutoff" TEXT,
    "minLeadDays" INTEGER NOT NULL DEFAULT 1,
    "maxLeadDays" INTEGER NOT NULL DEFAULT 3,
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeliveryZone_key_key" ON "DeliveryZone"("key");
CREATE INDEX "DeliveryZone_active_position_idx" ON "DeliveryZone"("active", "position");

-- Which zone priced an order, kept as plain text so renaming or deleting a
-- zone never rewrites the history of an order that already shipped.
ALTER TABLE "Order" ADD COLUMN "deliveryZoneKey" TEXT;

-- Baskets too perishable to hand to a carrier. Defaults to true so the whole
-- existing catalogue keeps behaving exactly as it does today; turn it off per
-- product for anything fresh, chilled or chocolate-heavy.
ALTER TABLE "Product" ADD COLUMN "shippable" BOOLEAN NOT NULL DEFAULT true;
