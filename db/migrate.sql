CREATE TABLE IF NOT EXISTS apikeys (
    key VARCHAR(32) PRIMARY KEY NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_data (
    artefact TEXT NOT NULL,
    userId INTEGER NOT NULL,
    apiKey VARCHAR(32) NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(ROWID)
    FOREIGN KEY(apiKey) REFERENCES apikeys(key)
);

CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(255) NOT NULL,
    password VARCHAR(60) NOT NULL,
    apiKey VARCHAR(32) NOT NULL,
    FOREIGN KEY(apiKey) REFERENCES apikeys(key),
    UNIQUE(email, apiKey)
);
