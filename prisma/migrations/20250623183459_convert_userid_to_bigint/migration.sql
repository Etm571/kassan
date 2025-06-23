-- Step 1: Add a new temporary column
ALTER TABLE "User" ADD COLUMN "userId_tmp" BIGINT;

-- Step 2: Copy data over
UPDATE "User" SET "userId_tmp" = "userId"::bigint;

-- Step 3: Drop any foreign key constraints on "userId" (if any exist)
-- ALTER TABLE ... DROP CONSTRAINT ...; -- (you must handle this if necessary)

-- Step 4: Drop the old column
ALTER TABLE "User" DROP COLUMN "userId";

-- Step 5: Rename the temp column to the original name
ALTER TABLE "User" RENAME COLUMN "userId_tmp" TO "userId";
