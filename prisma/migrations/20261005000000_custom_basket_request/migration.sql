-- CreateTable
CREATE TABLE "CustomBasketRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "products" TEXT NOT NULL,
    "occasion" TEXT,
    "budget" TEXT,
    "neededBy" TIMESTAMP(3),
    "deliveryArea" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomBasketRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomBasketRequest_status_createdAt_idx" ON "CustomBasketRequest"("status", "createdAt");

