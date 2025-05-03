-- Add CreatedAt column to Bookmarks table
ALTER TABLE "Bookmarks" ADD COLUMN "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP;
