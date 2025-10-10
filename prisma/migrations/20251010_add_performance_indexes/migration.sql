CREATE INDEX IF NOT EXISTS "fines_commit_date_idx" ON "fines"("commit_date");
CREATE INDEX IF NOT EXISTS "fines_decision_date_idx" ON "fines"("decision_date");
CREATE INDEX IF NOT EXISTS "fines_article_code_idx" ON "fines"("article_code");
CREATE INDEX IF NOT EXISTS "fines_case_number_idx" ON "fines"("case_number");
CREATE INDEX IF NOT EXISTS "fines_serial_number_idx" ON "fines"("serial_number");
CREATE INDEX IF NOT EXISTS "fines_amount_total_idx" ON "fines"("amount_total");
CREATE INDEX IF NOT EXISTS "fines_ecp_auth_id_status_idx" ON "fines"("ecp_auth_id", "status");
CREATE INDEX IF NOT EXISTS "fines_ecp_auth_id_commit_date_idx" ON "fines"("ecp_auth_id", "commit_date");

