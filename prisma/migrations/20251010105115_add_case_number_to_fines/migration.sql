-- AlterTable
ALTER TABLE "fines" ADD COLUMN "case_number" TEXT;

-- CreateIndex
CREATE INDEX "fines_case_number_idx" ON "fines"("case_number");

