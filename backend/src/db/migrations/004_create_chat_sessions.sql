CREATE TABLE IF NOT EXISTS chat_sessions (
  id             SERIAL PRIMARY KEY,
  lead_id        INT REFERENCES leads(id),
  messages       JSONB NOT NULL DEFAULT '[]',
  recommendation VARCHAR(200),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
