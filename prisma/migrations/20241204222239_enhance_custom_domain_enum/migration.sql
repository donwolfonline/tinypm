-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'DNS_VERIFICATION', 'ACTIVE', 'FAILED', 'SUSPENDED');

-- Safely handle the status column transition
-- First, create a temporary column
ALTER TABLE "CustomDomain" 
ADD COLUMN "status_new" "DomainStatus";

-- Set the new status based on the old text status
UPDATE "CustomDomain"
SET "status_new" = CASE 
    WHEN "status" = 'pending' THEN 'PENDING'::"DomainStatus"
    WHEN "status" = 'active' THEN 'ACTIVE'::"DomainStatus"
    ELSE 'PENDING'::"DomainStatus"
END;

-- Drop the old status column and rename the new one
ALTER TABLE "CustomDomain" 
DROP COLUMN "status",
ALTER COLUMN "status_new" SET NOT NULL,
ALTER COLUMN "status_new" SET DEFAULT 'PENDING'::"DomainStatus",
RENAME COLUMN "status_new" TO "status";

-- Add the new columns
ALTER TABLE "CustomDomain" 
ADD COLUMN IF NOT EXISTS "cnameTarget" TEXT NOT NULL DEFAULT 'tiny.pm',
ADD COLUMN IF NOT EXISTS "errorMessage" TEXT,
ADD COLUMN IF NOT EXISTS "lastAttemptAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "subscriptionId" TEXT,
ADD COLUMN IF NOT EXISTS "verificationAttempts" INTEGER NOT NULL DEFAULT 0;

-- Create the new index
CREATE INDEX IF NOT EXISTS "CustomDomain_status_idx" ON "CustomDomain"("status");