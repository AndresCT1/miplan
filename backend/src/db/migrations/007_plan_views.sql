CREATE TABLE IF NOT EXISTS plan_views (
  id        SERIAL PRIMARY KEY,
  plan_id   INT REFERENCES plans(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_views_plan_id   ON plan_views(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_views_viewed_at ON plan_views(viewed_at);
