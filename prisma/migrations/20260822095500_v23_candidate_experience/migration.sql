CREATE TABLE "CandidateSurvey" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "createdById" TEXT,
  "tokenHash" TEXT NOT NULL,
  "step" TEXT NOT NULL DEFAULT 'PROCESS',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastViewedAt" TIMESTAMP(3),
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "CandidateSurvey_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CandidateSurveyResponse" (
  "id" TEXT NOT NULL,
  "surveyId" TEXT NOT NULL,
  "clarity" INTEGER NOT NULL,
  "responsiveness" INTEGER NOT NULL,
  "respect" INTEGER NOT NULL,
  "transparency" INTEGER NOT NULL,
  "recommendation" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateSurveyResponse_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CandidateSurvey_tokenHash_key" ON "CandidateSurvey"("tokenHash");
CREATE INDEX "CandidateSurvey_organizationId_createdAt_idx" ON "CandidateSurvey"("organizationId", "createdAt");
CREATE INDEX "CandidateSurvey_matchId_idx" ON "CandidateSurvey"("matchId");
CREATE INDEX "CandidateSurvey_expiresAt_idx" ON "CandidateSurvey"("expiresAt");
CREATE UNIQUE INDEX "CandidateSurveyResponse_surveyId_key" ON "CandidateSurveyResponse"("surveyId");
CREATE INDEX "CandidateSurveyResponse_createdAt_idx" ON "CandidateSurveyResponse"("createdAt");

ALTER TABLE "CandidateSurvey" ADD CONSTRAINT "CandidateSurvey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CandidateSurvey" ADD CONSTRAINT "CandidateSurvey_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CandidateSurvey" ADD CONSTRAINT "CandidateSurvey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CandidateSurveyResponse" ADD CONSTRAINT "CandidateSurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "CandidateSurvey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
