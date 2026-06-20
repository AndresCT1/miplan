CREATE TABLE IF NOT EXISTS seller_sales (
  id                SERIAL PRIMARY KEY,
  seller_id         INT NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
  client_name       VARCHAR(200) NOT NULL,
  client_phone      VARCHAR(15) NOT NULL,
  operator_id       INT NOT NULL REFERENCES operators(id),
  plan_id           INT NOT NULL REFERENCES plans(id),
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','contacted','closed','lost')),
  commission_amount NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  follow_up_date    DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_sales_seller_id ON seller_sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_sales_follow_up ON seller_sales(follow_up_date)
  WHERE status NOT IN ('closed','lost');
