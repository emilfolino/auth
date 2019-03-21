$(> db/users.sqlite)
cat db/migrate.sql | sqlite3 db/users.sqlite
