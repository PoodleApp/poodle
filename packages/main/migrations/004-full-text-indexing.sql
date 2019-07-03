-- Up
create virtual table message_subject_index using fts5(
  envelope_subject,
  content=messages,
  content_rowid=id
);

insert into message_subject_index (rowid, envelope_subject)
select id, envelope_subject from messages;

create trigger messages_afterinsert_subject_index after insert on messages begin
  insert into message_subject_index (rowid, envelope_subject) values (new.id, new.envelope_subject);
end;

create trigger messages_afterdelete_subject_index after delete on messages begin
  insert into message_subject_index (message_subject_index, rowid, envelope_subject) values ('delete', old.id, old.envelope_subject);
end;

-- Down
drop trigger if exists messages_afterinsert_subject_index;
drop trigger if exists messages_afterdelete_subject_index;
drop table if exists message_subject_index;
