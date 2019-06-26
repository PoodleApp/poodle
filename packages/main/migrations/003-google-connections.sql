-- Up
CREATE TABLE google_connections (
  id integer primary key,
  account_id integer not null references accounts(id) on delete cascade,
  host text not null,
  mailbox text not null,
  name text
);

-- Down
DROP TABLE IF EXISTS google_connections;