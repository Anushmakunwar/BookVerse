using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBookmarksWithCreatedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add CreatedAt column to Bookmarks table if it doesn't exist
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = 'Bookmarks'
                        AND column_name = 'CreatedAt'
                    ) THEN
                        ALTER TABLE ""Bookmarks"" ADD COLUMN ""CreatedAt"" timestamp with time zone NULL;
                        UPDATE ""Bookmarks"" SET ""CreatedAt"" = CURRENT_TIMESTAMP;
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove CreatedAt column from Bookmarks table if it exists
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = 'Bookmarks'
                        AND column_name = 'CreatedAt'
                    ) THEN
                        ALTER TABLE ""Bookmarks"" DROP COLUMN ""CreatedAt"";
                    END IF;
                END $$;
            ");
        }
    }
}
