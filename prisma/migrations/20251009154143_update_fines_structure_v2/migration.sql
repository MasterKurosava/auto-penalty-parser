-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecp_authentications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "label" TEXT,
    "iin_bin" TEXT NOT NULL,
    "auth_token_enc" BYTEA NOT NULL,
    "refresh_token_enc" BYTEA,
    "uuid_enc" BYTEA NOT NULL,
    "psap_id" TEXT NOT NULL,
    "last_checked_at" TIMESTAMPTZ(6),
    "valid_until" TIMESTAMPTZ(6),
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ecp_authentications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fines" (
    "id" UUID NOT NULL,
    "ecp_auth_id" UUID NOT NULL,
    "external_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "commit_date" TIMESTAMPTZ(6),
    "decision_date" TIMESTAMPTZ(6),
    "full_name" TEXT NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "serial_number" TEXT,
    "article_code" TEXT NOT NULL,
    "article_name" TEXT NOT NULL,
    "amount_total" DECIMAL(14,2) NOT NULL,
    "pdf_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "ecp_authentications_user_id_idx" ON "ecp_authentications"("user_id");

-- CreateIndex
CREATE INDEX "ecp_authentications_iin_bin_idx" ON "ecp_authentications"("iin_bin");

-- CreateIndex
CREATE INDEX "ecp_authentications_is_valid_is_active_idx" ON "ecp_authentications"("is_valid", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "ecp_authentications_user_id_iin_bin_key" ON "ecp_authentications"("user_id", "iin_bin");

-- CreateIndex
CREATE INDEX "fines_ecp_auth_id_idx" ON "fines"("ecp_auth_id");

-- CreateIndex
CREATE INDEX "fines_external_id_idx" ON "fines"("external_id");

-- CreateIndex
CREATE INDEX "fines_status_idx" ON "fines"("status");

-- CreateIndex
CREATE INDEX "fines_vehicle_number_idx" ON "fines"("vehicle_number");

-- CreateIndex
CREATE INDEX "fines_full_name_idx" ON "fines"("full_name");

-- CreateIndex
CREATE UNIQUE INDEX "fines_ecp_auth_id_external_id_key" ON "fines"("ecp_auth_id", "external_id");

-- AddForeignKey
ALTER TABLE "ecp_authentications" ADD CONSTRAINT "ecp_authentications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fines" ADD CONSTRAINT "fines_ecp_auth_id_fkey" FOREIGN KEY ("ecp_auth_id") REFERENCES "ecp_authentications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
