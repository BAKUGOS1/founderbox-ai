-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "avatarInitials" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'Free Demo',
    "defaultProjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "integrations" JSONB NOT NULL DEFAULT '[]',
    "agentRunCount" INTEGER NOT NULL DEFAULT 0,
    "memoryHealth" INTEGER NOT NULL DEFAULT 52,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryItem" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT,
    "agent" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "duration" TEXT,
    "summary" TEXT,
    "input" JSONB,
    "result" JSONB,
    "logs" JSONB NOT NULL DEFAULT '[]',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PMDocument" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "idea" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PMDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QAReport" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "issues" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QAReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MigrationJob" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "mappings" JSONB NOT NULL,
    "validationErrors" JSONB NOT NULL,
    "previewRows" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MigrationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileObject" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "sourceAgent" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ready',
    "storageBucket" TEXT,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportItem" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Ready',
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'default',
    "encryptedSecret" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "keyVersion" TEXT NOT NULL DEFAULT 'v1',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "configuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "WorkspaceMember_workspaceId_idx" ON "WorkspaceMember"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_userId_workspaceId_key" ON "WorkspaceMember"("userId", "workspaceId");

-- CreateIndex
CREATE INDEX "Project_workspaceId_status_idx" ON "Project"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "MemoryItem_workspaceId_projectId_idx" ON "MemoryItem"("workspaceId", "projectId");

-- CreateIndex
CREATE INDEX "AgentRun_workspaceId_projectId_idx" ON "AgentRun"("workspaceId", "projectId");

-- CreateIndex
CREATE INDEX "AgentRun_workspaceId_status_idx" ON "AgentRun"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "PMDocument_workspaceId_projectId_idx" ON "PMDocument"("workspaceId", "projectId");

-- CreateIndex
CREATE INDEX "QAReport_workspaceId_projectId_idx" ON "QAReport"("workspaceId", "projectId");

-- CreateIndex
CREATE INDEX "MigrationJob_workspaceId_projectId_idx" ON "MigrationJob"("workspaceId", "projectId");

-- CreateIndex
CREATE INDEX "FileObject_workspaceId_projectId_idx" ON "FileObject"("workspaceId", "projectId");

-- CreateIndex
CREATE INDEX "ReportItem_workspaceId_projectId_idx" ON "ReportItem"("workspaceId", "projectId");

-- CreateIndex
CREATE INDEX "Credential_workspaceId_provider_idx" ON "Credential"("workspaceId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_workspaceId_provider_label_key" ON "Credential"("workspaceId", "provider", "label");

-- CreateIndex
CREATE INDEX "AuditEvent_workspaceId_createdAt_idx" ON "AuditEvent"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryItem" ADD CONSTRAINT "MemoryItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryItem" ADD CONSTRAINT "MemoryItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PMDocument" ADD CONSTRAINT "PMDocument_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PMDocument" ADD CONSTRAINT "PMDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QAReport" ADD CONSTRAINT "QAReport_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QAReport" ADD CONSTRAINT "QAReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationJob" ADD CONSTRAINT "MigrationJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationJob" ADD CONSTRAINT "MigrationJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileObject" ADD CONSTRAINT "FileObject_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileObject" ADD CONSTRAINT "FileObject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportItem" ADD CONSTRAINT "ReportItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportItem" ADD CONSTRAINT "ReportItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

