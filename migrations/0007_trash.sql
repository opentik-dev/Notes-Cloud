-- Soft-delete notes into a per-user trash with an expiration timestamp.
ALTER TABLE notes ADD COLUMN deleted_at TEXT;
CREATE INDEX IF NOT EXISTS idx_notes_trash ON notes(user_id, deleted_at);
