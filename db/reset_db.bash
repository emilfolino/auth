$(> db/images.sqlite)
cat db/migrate.sql | sqlite3 db/images.sqlite
