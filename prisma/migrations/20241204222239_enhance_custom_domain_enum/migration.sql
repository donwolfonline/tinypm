-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'DNS_VERIFICATION', 'ACTIVE', 'FAILED', 'SUSPENDED');

-- Add new status column with enum type
ALTER TABLE "CustomDomain" 
ADD COLUMN "status_new" "DomainStatus";

-- Migrate existing status values
UPDATE "CustomDomain"
SET "status_new" = CASE 
    WHEN "status"::text = 'pending' THEN 'PENDING'::"DomainStatus"
    WHEN "status"::text = 'active' THEN 'ACTIVE'::"DomainStatus"
    ELSE 'PENDING'::"DomainStatus"
END;

-- Set NOT NULL constraint on new column
ALTER TABLE "CustomDomain" 
ALTER COLUMN "status_new" SET NOT NULL;

-- Set default value
ALTER TABLE "CustomDomain" 
ALTER COLUMN "status_new" SET DEFAULT 'PENDING'::"DomainStatus";

-- Drop old status column
ALTER TABLE "CustomDomain" 
DROP COLUMN "status";

-- Rename new column to status
ALTER TABLE "CustomDomain" 
RENAME COLUMN "status_new" TO "status";

-- Add new columns with separate statements for clarity and safety
ALTER TABLE "CustomDomain" 
ADD COLUMN IF NOT EXISTS "cnameTarget" TEXT NOT NULL DEFAULT 'tiny.pm';

ALTER TABLE "CustomDomain" 
ADD COLUMN IF NOT EXISTS "errorMessage" TEXT;

ALTER TABLE "CustomDomain" 
ADD COLUMN IF NOT EXISTS "lastAttemptAt" TIMESTAMP(3);

ALTER TABLE "CustomDomain" 
ADD COLUMN IF NOT EXISTS "subscriptionId" TEXT;

ALTER TABLE "CustomDomain" 
ADD COLUMN IF NOT EXISTS "verificationAttempts" INTEGER NOT NULL DEFAULT 0;

-- Create index after all column operations are complete
CREATE INDEX IF NOT EXISTS "CustomDomain_status_idx" ON "CustomDomain"("status");