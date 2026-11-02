-- T30:用户体系数据表(Supabase Postgres)
-- 在 Supabase Dashboard → SQL Editor 里运行

-- 保存的命盘
CREATE TABLE IF NOT EXISTS charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  y INT NOT NULL,
  m INT NOT NULL,
  d INT NOT NULL,
  h INT NOT NULL,
  g TEXT NOT NULL CHECK (g IN ('m', 'f')),
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 购买记录(Stripe 支付成功时写入)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chart_params TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_charts_user ON charts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_params ON purchases(chart_params);

-- RLS:用户只能读写自己的数据
ALTER TABLE charts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "charts_select_own" ON charts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "charts_insert_own" ON charts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "charts_delete_own" ON charts FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "purchases_select_own" ON purchases FOR SELECT USING (auth.uid() = user_id);
-- purchases 的 INSERT 由服务端(service_role key)写入,不给客户端 INSERT 权限
