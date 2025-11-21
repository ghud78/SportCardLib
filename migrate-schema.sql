-- Migration script for card data model updates

-- 1. Rename subseries table to inserts
RENAME TABLE subseries TO inserts;

-- 2. Rename specialties table to parallels
RENAME TABLE specialties TO parallels;

-- 3. Rename foreign key columns in cards table
ALTER TABLE cards 
  CHANGE COLUMN subseriesId insertId INT,
  CHANGE COLUMN specialtyId parallelId INT;

-- 4. Add new columns to cards table
ALTER TABLE cards
  ADD COLUMN teamId INT AFTER playerName,
  ADD COLUMN memorabilia TEXT AFTER parallelId,
  ADD COLUMN autographTypeId INT AFTER isAutograph,
  ADD COLUMN isGraded INT NOT NULL DEFAULT 0 AFTER numberedCurrent,
  ADD COLUMN gradeCompanyId INT AFTER isGraded,
  ADD COLUMN gradeSerialNumber VARCHAR(40) AFTER gradeCompanyId;

-- 5. Create new tables
CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS autographTypes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gradeCompanies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cardGrades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cardId INT NOT NULL,
  gradeType ENUM('Centering', 'Corners', 'Surface', 'Edges', 'Overall', 'Autograph') NOT NULL,
  gradeQuality VARCHAR(20) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cardId) REFERENCES cards(id) ON DELETE CASCADE
);

-- 6. Insert default values
INSERT INTO autographTypes (name) VALUES 
  ('On-card'),
  ('Sticker'),
  ('Cloth'),
  ('Floor'),
  ('Ball'),
  ('Shoes'),
  ('Other')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO gradeCompanies (name) VALUES 
  ('PSA'),
  ('BGS'),
  ('CGC'),
  ('SGC')
ON DUPLICATE KEY UPDATE name=name;
