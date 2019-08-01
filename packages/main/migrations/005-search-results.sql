-- Up
create table searches (
  id integer primary key,
  account_id integer not null references accounts(id) on delete cascade,
  box_id integer not null references boxes(id) on delete cascade,
  query text not null,
  uidlastseen integer,
  unique(account_id, box_id, query)
);

create table messages_searches (
  message_id integer not null references messages(id) on delete cascade,
  search_id integer not null references searches(id) on delete cascade,
  updated_at text not null,
  primary key (message_id, search_id)
)

-- Down
drop table if exists messages_searches;
drop table if exists searches;
