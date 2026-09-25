-- One abandoned-checkout reminder per order, and a CASL opt-out list.
ALTER TABLE "Order" ADD COLUMN "abandonedEmailAt" TIMESTAMP(3);

CREATE TABLE "EmailOptOut" (
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailOptOut_pkey" PRIMARY KEY ("email")
);
