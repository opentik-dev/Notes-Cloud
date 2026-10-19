-- Task notes and persisted task lifecycle state.
ALTER TABLE notes ADD COLUMN kind TEXT NOT NULL DEFAULT 'note';
ALTER TABLE notes ADD COLUMN task_status TEXT NOT NULL DEFAULT 'active';
CREATE INDEX IF NOT EXISTS idx_notes_kind_status ON notes(user_id, kind, task_status);
