CREATE TABLE IF NOT EXISTS admin_sessions (
  session_id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx ON admin_sessions(expires_at);
