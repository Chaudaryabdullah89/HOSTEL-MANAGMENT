-- Manual Warden Schema Migration v2
-- Handles the case where hostelIds column already exists

-- Step 1: Check if hostelId column still exists and migrate data if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Warden' AND column_name = 'hostelId'
    ) THEN
        -- Migrate data from hostelId to hostelIds for records that haven't been migrated
        UPDATE "Warden" 
        SET "hostelIds" = ARRAY["hostelId"]::TEXT[]
        WHERE "hostelId" IS NOT NULL 
        AND (array_length("hostelIds", 1) IS NULL OR "hostelIds" = '{}');
        
        RAISE NOTICE 'Data migrated from hostelId to hostelIds';
    ELSE
        RAISE NOTICE 'hostelId column does not exist, skipping data migration';
    END IF;
END $$;

-- Step 2: Ensure empty arrays for records without hostels
UPDATE "Warden" 
SET "hostelIds" = '{}'
WHERE "hostelIds" IS NULL OR array_length("hostelIds", 1) IS NULL;

-- Step 3: Drop the old hostelId column if it exists
ALTER TABLE "Warden" DROP COLUMN IF EXISTS "hostelId";

-- Step 4: Make sure the hostelIds column is NOT NULL with default
ALTER TABLE "Warden" ALTER COLUMN "hostelIds" SET DEFAULT '{}';
ALTER TABLE "Warden" ALTER COLUMN "hostelIds" SET NOT NULL;

-- Step 5: Add unique constraint on userId if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Warden_userId_key' AND conrelid = '"Warden"'::regclass
    ) THEN
        ALTER TABLE "Warden" ADD CONSTRAINT "Warden_userId_key" UNIQUE ("userId");
        RAISE NOTICE 'Unique constraint added on userId';
    ELSE
        RAISE NOTICE 'Unique constraint on userId already exists';
    END IF;
END $$;

-- Step 6: Verify the final state
SELECT 
    id,
    "userId",
    "hostelIds",
    array_length("hostelIds", 1) as hostel_count
FROM "Warden"
ORDER BY id;

