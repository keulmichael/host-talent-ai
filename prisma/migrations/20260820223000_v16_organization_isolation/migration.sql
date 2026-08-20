CREATE TABLE "Organization" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Organization" ("id", "name") VALUES ('host-demo', 'Host Talent AI — Cabinet pilote');

ALTER TABLE "Job" ADD COLUMN "organizationId" TEXT NOT NULL DEFAULT 'host-demo';
ALTER TABLE "Candidate" ADD COLUMN "organizationId" TEXT NOT NULL DEFAULT 'host-demo';
ALTER TABLE "Match" ADD COLUMN "organizationId" TEXT NOT NULL DEFAULT 'host-demo';

CREATE INDEX "Job_organizationId_idx" ON "Job"("organizationId");
CREATE INDEX "Candidate_organizationId_idx" ON "Candidate"("organizationId");
CREATE INDEX "Candidate_organizationId_email_idx" ON "Candidate"("organizationId", "email");
CREATE INDEX "Match_organizationId_idx" ON "Match"("organizationId");

ALTER TABLE "Job" ADD CONSTRAINT "Job_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
