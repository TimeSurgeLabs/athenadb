DROP TABLE IF EXISTS entries;
CREATE TABLE entries (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	text TEXT NOT NULL,
	space TEXT NOT NULL,
	uuid TEXT NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
