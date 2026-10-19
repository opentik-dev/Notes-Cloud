ALTER TABLE users ADD COLUMN profile_asset_id INTEGER;
ALTER TABLE users ADD COLUMN profile_status TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN profile_updated_at TEXT;
ALTER TABLE users ADD COLUMN last_seen_at TEXT;

CREATE TABLE IF NOT EXISTS friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','blocked')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(requester_id, addressee_id)
);
CREATE TABLE IF NOT EXISTS note_shares (
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_with_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'view' CHECK(permission IN ('view','edit')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY(note_id, shared_with_id)
);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(requester_id, addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_note_shares_recipient ON note_shares(shared_with_id, created_at DESC);
