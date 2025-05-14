-- Check if CreatedAt column exists in Bookmarks table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Bookmarks'
        AND column_name = 'CreatedAt'
    ) THEN
        -- Add CreatedAt column to Bookmarks table
        ALTER TABLE "Bookmarks" ADD COLUMN "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'CreatedAt column added to Bookmarks table';
    ELSE
        RAISE NOTICE 'CreatedAt column already exists in Bookmarks table';
    END IF;
END $$;
