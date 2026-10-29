-- AlterTable: per-browser ownership + share access
ALTER TABLE "Design" ADD COLUMN "ownerId" TEXT,
ADD COLUMN "access" TEXT NOT NULL DEFAULT 'private';

-- Designs created before sessions existed were open to everyone: keep their
-- links working (they are claimed by the first browser that opens them).
UPDATE "Design" SET "access" = 'link' WHERE "ownerId" IS NULL;

-- CreateIndex
CREATE INDEX "Design_ownerId_deletedAt_updatedAt_idx" ON "Design"("ownerId", "deletedAt", "updatedAt");
