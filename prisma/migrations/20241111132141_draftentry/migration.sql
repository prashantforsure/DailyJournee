-- CreateTable
CREATE TABLE "EntryDraft" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,

    CONSTRAINT "EntryDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EntryDraft_userId_journalId_key" ON "EntryDraft"("userId", "journalId");

-- AddForeignKey
ALTER TABLE "EntryDraft" ADD CONSTRAINT "EntryDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryDraft" ADD CONSTRAINT "EntryDraft_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
