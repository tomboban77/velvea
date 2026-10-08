-- CreateTable
CREATE TABLE "BrandPartnerInquiry" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "category" TEXT,
    "location" TEXT,
    "pricing" TEXT,
    "message" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandPartnerInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandPartnerInquiry_status_createdAt_idx" ON "BrandPartnerInquiry"("status", "createdAt");
