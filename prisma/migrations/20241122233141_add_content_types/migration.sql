-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('LINK', 'TITLE', 'DIVIDER', 'TEXT');

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL DEFAULT 'LINK',
    "title" TEXT,
    "url" TEXT,
    "text" TEXT,
    "emoji" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data
INSERT INTO "Content" (
    "id",
    "type",
    "title",
    "url",
    "emoji",
    "order",
    "enabled",
    "clicks",
    "userId",
    "createdAt",
    "updatedAt"
)
SELECT 
    "id",
    'LINK'::"ContentType",
    "title",
    "url",
    "emoji",
    "order",
    "enabled",
    "clicks",
    "userId",
    "createdAt",
    "updatedAt"
FROM "Link";

-- After verifying the migration worked, you can uncomment this to remove the old table
--DROP TABLE "Link";