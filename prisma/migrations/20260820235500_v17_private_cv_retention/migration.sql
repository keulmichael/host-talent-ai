ALTER TABLE "Organization"
ADD COLUMN "retentionMonths" INTEGER NOT NULL DEFAULT 24;

ALTER TABLE "Candidate"
ADD COLUMN "filePathname" TEXT,
ADD COLUMN "fileContentType" TEXT,
ADD COLUMN "fileSize" INTEGER,
ADD COLUMN "dataSource" TEXT NOT NULL DEFAULT 'CV_IMPORT',
ADD COLUMN "privacyNote" TEXT,
ADD COLUMN "retentionUntil" TIMESTAMP(3);

UPDATE "Candidate"
SET "retentionUntil" = "createdAt" + INTERVAL '24 months'
WHERE "retentionUntil" IS NULL;

CREATE INDEX "Candidate_organizationId_retentionUntil_idx"
ON "Candidate"("organizationId", "retentionUntil");
