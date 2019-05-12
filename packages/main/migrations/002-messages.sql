-- Up
create table boxes(
  id integer primary key,
  account_id integer not null references accounts(id) on delete cascade,
  name text not null,
  uidvalidity integer not null,
  uidnext integer,
  unique (account_id, name) on conflict replace
);

create table messages(
  id integer primary key,
  account_id integer references accounts(id) on delete cascade,
  box_id integer references boxes(id) on delete cascade,
  date text,
  envelope_date text,
  envelope_inReplyTo text,
  envelope_messageId text not null,
  envelope_subject text,
  modseq text,
  uid integer,
  updated_at text,
  x_gm_msgid text,
  x_gm_thrid text
);

create table message_participants(
  id integer primary key,
  message_id integer references messages(id) on delete cascade,
  type text not null, -- 'to', 'from', 'cc', 'bcc', 'replyTo', 'sender'
  host text not null,
  mailbox text not null,
  name text
);

create table message_flags(
  id integer primary key,
  message_id integer not null references messages(id) on delete cascade,
  flag text not null,
  unique(message_id, flag)
);

create table message_gmail_labels (
  id integer primary key,
  message_id integer not null references messages(id) on delete cascade,
  label text not null
);

create table message_structs (
  id integer primary key,
  message_id integer not null references messages(id) on delete cascade,
  lft number not null,
  rgt number not null,
  content_id text,
  description text,
  disposition_filename text,
  disposition_name text,
  disposition_type text,
  encoding text,
  md5 text,
  params_charset text,
  part_id text,
  size number,
  subtype text not null, -- e.g. 'plain'
  type text not null -- e.g. 'text'
);

create table message_references (
  id integer primary key,
  message_id integer not null references messages(id) on delete cascade,
  referenced_id text not null
);

create table message_headers (
  id integer primary key,
  message_id integer not null references messages(id) on delete cascade,
  key text not null,
  value text not null
);

create table message_bodies (
  message_struct_id integer primary key references message_structs(id) on delete cascade,
  content blob not null
);

-- Down
drop table if exists message_bodies;
drop table if exists message_headers;
drop table if exists message_references;
drop table if exists message_structs;
drop table if exists message_gmail_labels;
drop table if exists message_flags;
drop table if exists message_participants;
drop table if exists messages;
drop table if exists boxes;
