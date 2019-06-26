-- Up
CREATE TABLE `accounts` (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  Google_API_syncToken text
);

-- Down
DROP TABLE IF EXISTS `accounts`;
