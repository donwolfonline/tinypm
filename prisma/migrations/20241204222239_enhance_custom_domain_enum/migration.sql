/*
  Warnings:

  - The `status` column on the `CustomDomain` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Link` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'DNS_VERIFICATION', 'ACTIVE', 'FAILED', 'SUSPENDED');

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_userId_fkey";

-- AlterTable
ALTER TABLE "CustomDomain" ADD COLUMN     "cnameTarget" TEXT NOT NULL DEFAULT 'tiny.pm',
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "lastAttemptAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionId" TEXT,
ADD COLUMN     "verificationAttempts" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "DomainStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "Link";

-- CreateIndex
CREATE INDEX "CustomDomain_status_idx" ON "CustomDomain"("status");
