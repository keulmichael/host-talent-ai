CREATE TABLE "TalentSnapshot" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "snapshotDate" TIMESTAMP(3) NOT NULL,
  "candidateCount" INTEGER NOT NULL,
  "jobCount" INTEGER NOT NULL,
  "matchCoverage" INTEGER NOT NULL,
  "skillCount" INTEGER NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TalentSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TalentSnapshot_organizationId_snapshotDate_key" ON "TalentSnapshot"("organizationId", "snapshotDate");
CREATE INDEX "TalentSnapshot_organizationId_snapshotDate_idx" ON "TalentSnapshot"("organizationId", "snapshotDate");

ALTER TABLE "TalentSnapshot"
ADD CONSTRAINT "TalentSnapshot_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
