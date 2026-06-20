CREATE TABLE IF NOT EXISTS operator_commissions (
  operator_id    INT PRIMARY KEY REFERENCES operators(id) ON DELETE CASCADE,
  commission_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00
                 CHECK (commission_pct >= 0 AND commission_pct <= 100),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: one row per operator, starting at 0%
INSERT INTO operator_commissions (operator_id, commission_pct)
SELECT id, 0.00 FROM operators
ON CONFLICT (operator_id) DO NOTHING;
