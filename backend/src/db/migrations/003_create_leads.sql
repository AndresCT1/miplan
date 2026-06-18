CREATE TABLE IF NOT EXISTS leads (
  id           SERIAL PRIMARY KEY,
  dni          CHAR(8)      NOT NULL,
  name         VARCHAR(200) NOT NULL,
  address      TEXT         NOT NULL,
  phone        CHAR(9)      NOT NULL,
  operator_id  INT REFERENCES operators(id),
  plan_id      INT REFERENCES plans(id),
  status       VARCHAR(20)  DEFAULT 'pending'
               CHECK (status IN ('pending','contacted','interested','closed','lost')),
  chat_summary TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
