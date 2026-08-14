-- CreateEnum
CREATE TYPE "MediaResourceType" AS ENUM ('IMAGE', 'VIDEO', 'RAW');

-- CreateEnum
CREATE TYPE "MediaPurgeState" AS ENUM ('RESERVED', 'ACTIVE', 'PENDING', 'PURGED', 'FAILED');

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "resourceType" "MediaResourceType" NOT NULL,
    "folder" TEXT NOT NULL,
    "url" TEXT,
    "bytes" INTEGER NOT NULL DEFAULT 0,
    "format" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "durationSec" INTEGER,
    "purgeState" "MediaPurgeState" NOT NULL DEFAULT 'RESERVED',
    "purgeAttempts" INTEGER NOT NULL DEFAULT 0,
    "purgeNotBefore" TIMESTAMP(3),
    "leaseOwner" TEXT,
    "leaseExpiresAt" TIMESTAMP(3),
    "purgedAt" TIMESTAMP(3),
    "lastPurgeError" TEXT,
    "uploadedByUserId" TEXT,
    "moduleId" TEXT,
    "galleryPhotoId" TEXT,
    "announcementId" TEXT,
    "postId" TEXT,
    "replyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_publicId_key" ON "MediaAsset"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_moduleId_key" ON "MediaAsset"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_galleryPhotoId_key" ON "MediaAsset"("galleryPhotoId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_announcementId_key" ON "MediaAsset"("announcementId");

-- CreateIndex
CREATE INDEX "MediaAsset_postId_idx" ON "MediaAsset"("postId");

-- CreateIndex
CREATE INDEX "MediaAsset_replyId_idx" ON "MediaAsset"("replyId");

-- CreateIndex
CREATE INDEX "MediaAsset_uploadedByUserId_createdAt_idx" ON "MediaAsset"("uploadedByUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_galleryPhotoId_fkey" FOREIGN KEY ("galleryPhotoId") REFERENCES "GalleryPhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Reply"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Partial index for the purge worker's claim scan (see
-- media-asset.repository.ts `claimPurgeBatch`). The overwhelming majority
-- of rows will sit in ACTIVE (referenced and never deleted) or PURGED
-- (already cleaned up); only PENDING and RESERVED rows are ever claimable
-- work. A plain btree on (purgeState, purgeNotBefore) would index every
-- ACTIVE/PURGED row too — dead weight on every write, for a lookup that
-- only ever wants the PENDING/RESERVED sliver. Postgres partial indexes
-- solve exactly this: only matching rows are stored, so the index stays
-- small and cheap to maintain regardless of how large MediaAsset grows.
--
-- Not CREATE INDEX CONCURRENTLY: Prisma applies each migration file inside
-- a single transaction, and CONCURRENTLY cannot run inside a transaction
-- block (Postgres error 25001). That tradeoff is safe here specifically
-- because this is the migration that creates MediaAsset — the table has
-- zero rows and no production traffic yet, so a plain CREATE INDEX takes
-- no meaningful lock and blocks nothing. Preserve this as raw SQL on any
-- future `prisma migrate diff` — the Prisma schema DSL has no partial-index
-- syntax, so it cannot be regenerated from schema.prisma alone.
CREATE INDEX "MediaAsset_purge_queue_idx"
  ON "MediaAsset" ("purgeNotBefore", "createdAt")
  WHERE "purgeState" IN ('PENDING', 'RESERVED');
