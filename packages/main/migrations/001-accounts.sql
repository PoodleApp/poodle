-- Up
CREATE TABLE `accounts` (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
);

-- Down
DROP TABLE IF EXISTS `accounts`;
