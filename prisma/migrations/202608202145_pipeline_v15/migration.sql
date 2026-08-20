ALTER TABLE "Match" ADD COLUMN "stage" TEXT NOT NULL DEFAULT 'NEW';
ALTER TABLE "Match" ADD COLUMN "recruiterNote" TEXT;
ALTER TABLE "Match" ADD COLUMN "nextAction" TEXT;
ALTER TABLE "Match" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX "Match_stage_idx" ON "Match"("stage");
CREATE INDEX "Match_score_idx" ON "Match"("score");
