CREATE DATABASE IF NOT EXISTS message_db;
USE message_db;

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO messages (message) VALUES ('Premier message de test');
INSERT INTO messages (message) VALUES ('Bienvenue dans l''application Docker!');