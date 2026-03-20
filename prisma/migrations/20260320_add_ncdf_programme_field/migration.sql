-- CreateEnum for Programme
CREATE TYPE "Programme" AS ENUM ('IMPACT_SCHOOL', 'IMPACT_UNI', 'IMPACT_CIRCLE');

-- AddColumn programme to User
ALTER TABLE "User" ADD COLUMN "programme" "Programme" DEFAULT 'IMPACT_SCHOOL';

-- CreateIndex for programme
CREATE INDEX "User_programme_idx" ON "User"("programme");
