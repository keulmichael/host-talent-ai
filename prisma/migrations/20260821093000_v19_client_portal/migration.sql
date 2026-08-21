ALTER TABLE "Candidate" ADD COLUMN "availability" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "dailyRate" INTEGER;
ALTER TABLE "Candidate" ADD COLUMN "salaryExpectation" INTEGER;

CREATE TABLE "ClientShare" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "label" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastViewedAt" TIMESTAMP(3),
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ClientShare_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientFeedback" (
  "id" TEXT NOT NULL,
  "shareId" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "clientName" TEXT,
  "decision" TEXT NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClientFeedback_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClientShare_tokenHash_key" ON "ClientShare"("tokenHash");
CREATE INDEX "ClientShare_organizationId_jobId_idx" ON "ClientShare"("organizationId", "jobId");
CREATE INDEX "ClientShare_expiresAt_idx" ON "ClientShare"("expiresAt");
CREATE INDEX "ClientFeedback_shareId_idx" ON "ClientFeedback"("shareId");
CREATE INDEX "ClientFeedback_matchId_idx" ON "ClientFeedback"("matchId");

ALTER TABLE "ClientShare" ADD CONSTRAINT "ClientShare_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientShare" ADD CONSTRAINT "ClientShare_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientShare" ADD CONSTRAINT "ClientShare_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientFeedback" ADD CONSTRAINT "ClientFeedback_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "ClientShare"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientFeedback" ADD CONSTRAINT "ClientFeedback_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
