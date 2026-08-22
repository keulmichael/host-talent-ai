ALTER TABLE "Match" ADD COLUMN "candidateInterest" TEXT;

CREATE TABLE "CandidateActivity" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "matchId" TEXT,
  "createdById" TEXT,
  "type" TEXT NOT NULL DEFAULT 'NOTE',
  "channel" TEXT NOT NULL DEFAULT 'EMAIL',
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "subject" TEXT,
  "body" TEXT,
  "dueAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CandidateActivity_organizationId_dueAt_idx" ON "CandidateActivity"("organizationId", "dueAt");
CREATE INDEX "CandidateActivity_candidateId_createdAt_idx" ON "CandidateActivity"("candidateId", "createdAt");
CREATE INDEX "CandidateActivity_matchId_createdAt_idx" ON "CandidateActivity"("matchId", "createdAt");
CREATE INDEX "CandidateActivity_status_dueAt_idx" ON "CandidateActivity"("status", "dueAt");

ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
