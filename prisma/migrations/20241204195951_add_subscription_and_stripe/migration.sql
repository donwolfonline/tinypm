-- Step 1: Create new types and tables
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- Step 2: Add nullable stripe customer ID first
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;

-- Step 3: Create Subscription table with initially nullable foreign key
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create CustomDomain table (already safe as-is)
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verificationCode" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- Step 5: Add indexes and unique constraints
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");

CREATE UNIQUE INDEX "CustomDomain_domain_key" ON "CustomDomain"("domain");
CREATE UNIQUE INDEX "CustomDomain_verificationCode_key" ON "CustomDomain"("verificationCode");
CREATE INDEX "CustomDomain_userId_idx" ON "CustomDomain"("userId");
CREATE INDEX "CustomDomain_domain_idx" ON "CustomDomain"("domain");

-- Step 6: Add missing indexes to existing tables (safe to add)
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Content_userId_idx" ON "Content"("userId");
CREATE INDEX IF NOT EXISTS "Content_type_idx" ON "Content"("type");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"("username");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");

-- Step 7: Add unique constraint to stripe customer ID after index is created
ALTER TABLE "User" ADD CONSTRAINT "User_stripeCustomerId_key" UNIQUE ("stripeCustomerId");

-- Step 8: Add foreign key constraints
ALTER TABLE "Subscription" 
ADD CONSTRAINT "Subscription_userId_fkey" 
FOREIGN KEY ("userId") 
REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CustomDomain" 
ADD CONSTRAINT "CustomDomain_userId_fkey" 
FOREIGN KEY ("userId") 
REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;