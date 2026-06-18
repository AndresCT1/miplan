CREATE TABLE IF NOT EXISTS plans (
  id          SERIAL PRIMARY KEY,
  operator_id INT REFERENCES operators(id) ON DELETE CASCADE,
  name        VARCHAR(150) NOT NULL,
  speed_mbps  INT NOT NULL,
  price       NUMERIC(8,2) NOT NULL,
  features    TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
