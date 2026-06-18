CREATE TABLE IF NOT EXISTS operators (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(50)  UNIQUE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  logo_url    TEXT,
  brand_color CHAR(7),
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO operators (slug, name, brand_color) VALUES
  ('movistar', 'Movistar', '#019DF4'),
  ('claro',    'Claro',    '#DA291C'),
  ('wow',      'WOW',      '#FF6B00'),
  ('win',      'WIN',      '#6C2D91'),
  ('mi-fibra', 'Mi Fibra', '#00A651')
ON CONFLICT (slug) DO NOTHING;
