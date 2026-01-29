PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS clubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    league TEXT NOT NULL,
    country TEXT NOT NULL,
    cohesion INTEGER NOT NULL DEFAULT 70
);

CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    age INTEGER NOT NULL,
    technical INTEGER NOT NULL,
    mental INTEGER NOT NULL,
    physical INTEGER NOT NULL,
    experience INTEGER NOT NULL,
    club_id INTEGER,
    FOREIGN KEY (club_id) REFERENCES clubs (id)
);

CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    home_club_id INTEGER NOT NULL,
    away_club_id INTEGER NOT NULL,
    home_goals INTEGER NOT NULL,
    away_goals INTEGER NOT NULL,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_club_id) REFERENCES clubs (id),
    FOREIGN KEY (away_club_id) REFERENCES clubs (id)
);

INSERT OR IGNORE INTO clubs (name, league, country, cohesion)
VALUES
    ('Sporting Aurora', 'Liga Nacional', 'Brasil', 78),
    ('Atlético Boreal', 'Liga Nacional', 'Brasil', 72);

INSERT OR IGNORE INTO players (name, position, age, technical, mental, physical, experience, club_id)
VALUES
    ('Caio Mendes', 'ST', 26, 82, 75, 78, 70, 1),
    ('Luan Ribeiro', 'CM', 29, 79, 82, 74, 76, 1),
    ('Henrique Lopes', 'CB', 31, 74, 80, 77, 83, 1),
    ('Diego Alves', 'GK', 27, 76, 78, 80, 69, 1),
    ('Bruno Costa', 'ST', 24, 80, 72, 82, 63, 2),
    ('Rafael Dias', 'CM', 28, 77, 79, 75, 72, 2),
    ('Pedro Souza', 'CB', 30, 73, 78, 76, 79, 2),
    ('Matheus Silva', 'GK', 25, 75, 74, 81, 66, 2);
