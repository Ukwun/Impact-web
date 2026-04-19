-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('CRITICAL', 'WARNING', 'INFO');

-- CreateTable
CREATE TABLE "SystemAlert" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "category" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SystemAlert_severity_idx" ON "SystemAlert"("severity");

-- CreateIndex
CREATE INDEX "SystemAlert_resolved_idx" ON "SystemAlert"("resolved");

-- CreateIndex
CREATE INDEX "SystemAlert_category_idx" ON "SystemAlert"("category");

-- CreateIndex
CREATE INDEX "SystemAlert_createdAt_idx" ON "SystemAlert"("createdAt");

-- Insert seed data with initial system alerts
INSERT INTO "SystemAlert" (id, title, message, severity, category, source, "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, 'System Status', 'All systems operational', 'INFO', 'System', 'system', NOW(), NOW()),
  (gen_random_uuid()::text, 'Database Backup', 'Last backup completed successfully', 'INFO', 'System', 'system', NOW() - interval '1 hour', NOW() - interval '1 hour');
