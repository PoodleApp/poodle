-- Up
CREATE TABLE `accounts` (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  Google_API_syncToken TEXT 
);

-- Down
DROP TABLE IF EXISTS `accounts`;
