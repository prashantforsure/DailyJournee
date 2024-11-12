/*
  Warnings:

  - Added the required column `userId` to the `Entry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Step 1: Add columns without the NOT NULL constraint
ALTER TABLE "Entry" 
ADD COLUMN "isTimeCapsule" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "userId" TEXT;

-- Step 2: Create the TimeCapsule table
CREATE TABLE "TimeCapsule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openDate" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    CONSTRAINT "TimeCapsule_pkey" PRIMARY KEY ("id")
);

-- Step 3: Add Foreign Key constraints for TimeCapsule
ALTER TABLE "TimeCapsule" 
ADD CONSTRAINT "TimeCapsule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "TimeCapsule_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 4: Add foreign key constraint to Entry table for userId
ALTER TABLE "Entry" 
ADD CONSTRAINT "Entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Set default values for any existing rows
UPDATE "Entry" SET "userId" = 'cm3elg32p0008fo1ulumwemm5' WHERE "userId" IS NULL;

-- Step 6: Apply the NOT NULL constraint after setting defaults
ALTER TABLE "Entry" ALTER COLUMN "userId" SET NOT NULL;



