-- Wave A: real password reset state, community requests, and write idempotency.
CREATE TYPE "CommunityRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "Assignment" ADD COLUMN "idempotencyKey" TEXT;
CREATE UNIQUE INDEX "Assignment_idempotencyKey_key" ON "Assignment"("idempotencyKey");

ALTER TABLE "Announcement" ADD COLUMN "idempotencyKey" TEXT;
CREATE UNIQUE INDEX "Announcement_idempotencyKey_key" ON "Announcement"("idempotencyKey");

CREATE TABLE "CommunityRequest" (
  "id" TEXT NOT NULL,
  "requesterId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "status" "CommunityRequestStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunityRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CommunityRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CommunityRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CommunityRequest_idempotencyKey_key" ON "CommunityRequest"("idempotencyKey");
CREATE UNIQUE INDEX "CommunityRequest_requesterId_name_region_key" ON "CommunityRequest"("requesterId", "name", "region");
CREATE INDEX "CommunityRequest_status_createdAt_idx" ON "CommunityRequest"("status", "createdAt");
CREATE INDEX "CommunityRequest_requesterId_idx" ON "CommunityRequest"("requesterId");

CREATE TABLE "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");
CREATE INDEX "PasswordResetToken_usedAt_idx" ON "PasswordResetToken"("usedAt");
