#!/bin/bash

# PostgreSQL connection details from appsettings.json
PGHOST="localhost"
PGDATABASE="BookStore"
PGUSER="postgres"
PGPASSWORD="password"

# SQL command to execute
SQL_COMMAND="ALTER TABLE \"Bookmarks\" ADD COLUMN \"CreatedAt\" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP;"

# Execute the SQL command
echo "Executing SQL command: $SQL_COMMAND"
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -d $PGDATABASE -U $PGUSER -c "$SQL_COMMAND"

# Check the result
if [ $? -eq 0 ]; then
    echo "Database update successful!"
else
    echo "Error updating database."
fi
