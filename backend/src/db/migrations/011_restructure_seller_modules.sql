-- 011: Módulos Clientes y Prospectos para vendedores

ALTER TABLE sellers ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS callmebot_apikey VARCHAR(50);

CREATE TABLE IF NOT EXISTS seller_clients (
  id                 SERIAL PRIMARY KEY,
  seller_id          INT REFERENCES sellers(id) ON DELETE CASCADE,
  client_name        VARCHAR(200) NOT NULL,
  client_phone       VARCHAR(9),
  operator_id        INT REFERENCES operators(id),
  plan_id            INT REFERENCES plans(id),
  regular_price      NUMERIC(8,2) NOT NULL,
  commission_pct     NUMERIC(5,2) NOT NULL,
  commission_amount  NUMERIC(8,2) GENERATED ALWAYS AS
                       (regular_price * commission_pct / 100) STORED,
  installation_date  DATE NOT NULL,
  commission_status  VARCHAR(20) DEFAULT 'pending'
                       CHECK (commission_status IN ('pending','paid')),
  commission_paid_at TIMESTAMPTZ,
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_prospects (
  id                     SERIAL PRIMARY KEY,
  seller_id              INT REFERENCES sellers(id) ON DELETE CASCADE,
  prospect_name          VARCHAR(200) NOT NULL,
  prospect_phone         VARCHAR(9),
  operator_id            INT REFERENCES operators(id),
  plan_id                INT REFERENCES plans(id),
  source                 VARCHAR(50) DEFAULT 'otro'
                           CHECK (source IN ('facebook','instagram','referido','whatsapp','otro')),
  status                 VARCHAR(30) DEFAULT 'nuevo'
                           CHECK (status IN ('nuevo','contactado','interesado','propuesta','cerrado','perdido')),
  next_contact_date      DATE,
  contact_attempts       INT DEFAULT 0,
  notes                  TEXT,
  converted_to_client_id INT REFERENCES seller_clients(id),
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_clients_seller     ON seller_clients(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_clients_commission ON seller_clients(commission_status);
CREATE INDEX IF NOT EXISTS idx_seller_prospects_seller   ON seller_prospects(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_prospects_contact  ON seller_prospects(next_contact_date);
CREATE INDEX IF NOT EXISTS idx_seller_prospects_status   ON seller_prospects(status);
