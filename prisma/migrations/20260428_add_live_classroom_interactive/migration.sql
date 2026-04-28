-- Migration: Add live classroom interactive features
-- Polls, Q&A, Breakout Rooms, Engagement Tracking

-- LiveSessionPoll
CREATE TABLE IF NOT EXISTS "LiveSessionPoll" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[] NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "allowMultiple" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveSessionPoll_pkey" PRIMARY KEY ("id")
);

-- LiveSessionPollResponse
CREATE TABLE IF NOT EXISTS "LiveSessionPollResponse" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "selectedOptions" TEXT[] NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveSessionPollResponse_pkey" PRIMARY KEY ("id")
);

-- LiveSessionQuestion
CREATE TABLE IF NOT EXISTS "LiveSessionQuestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "answerText" TEXT,
    "answeredByUserId" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveSessionQuestion_pkey" PRIMARY KEY ("id")
);

-- LiveSessionBreakoutRoom
CREATE TABLE IF NOT EXISTS "LiveSessionBreakoutRoom" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "meetingUrl" TEXT,
    "memberUserIds" TEXT[] NOT NULL DEFAULT '{}',
    "topic" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveSessionBreakoutRoom_pkey" PRIMARY KEY ("id")
);

-- LiveSessionEngagement
CREATE TABLE IF NOT EXISTS "LiveSessionEngagement" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveSessionEngagement_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "LiveSessionPoll_sessionId_idx" ON "LiveSessionPoll"("sessionId");
CREATE INDEX IF NOT EXISTS "LiveSessionPoll_status_idx" ON "LiveSessionPoll"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "LiveSessionPollResponse_pollId_userId_key" ON "LiveSessionPollResponse"("pollId", "userId");
CREATE INDEX IF NOT EXISTS "LiveSessionPollResponse_pollId_idx" ON "LiveSessionPollResponse"("pollId");
CREATE INDEX IF NOT EXISTS "LiveSessionPollResponse_userId_idx" ON "LiveSessionPollResponse"("userId");

CREATE INDEX IF NOT EXISTS "LiveSessionQuestion_sessionId_idx" ON "LiveSessionQuestion"("sessionId");
CREATE INDEX IF NOT EXISTS "LiveSessionQuestion_userId_idx" ON "LiveSessionQuestion"("userId");
CREATE INDEX IF NOT EXISTS "LiveSessionQuestion_status_idx" ON "LiveSessionQuestion"("status");

CREATE INDEX IF NOT EXISTS "LiveSessionBreakoutRoom_sessionId_idx" ON "LiveSessionBreakoutRoom"("sessionId");

CREATE INDEX IF NOT EXISTS "LiveSessionEngagement_sessionId_idx" ON "LiveSessionEngagement"("sessionId");
CREATE INDEX IF NOT EXISTS "LiveSessionEngagement_userId_idx" ON "LiveSessionEngagement"("userId");
CREATE INDEX IF NOT EXISTS "LiveSessionEngagement_eventType_idx" ON "LiveSessionEngagement"("eventType");

-- Foreign Keys
ALTER TABLE "LiveSessionPoll"
    ADD CONSTRAINT "LiveSessionPoll_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LiveSessionPollResponse"
    ADD CONSTRAINT "LiveSessionPollResponse_pollId_fkey"
    FOREIGN KEY ("pollId") REFERENCES "LiveSessionPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LiveSessionQuestion"
    ADD CONSTRAINT "LiveSessionQuestion_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LiveSessionQuestion"
    ADD CONSTRAINT "LiveSessionQuestion_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LiveSessionBreakoutRoom"
    ADD CONSTRAINT "LiveSessionBreakoutRoom_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LiveSessionEngagement"
    ADD CONSTRAINT "LiveSessionEngagement_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
