CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL, -- NULL para anónimos, FK real si hay auth
  session_id TEXT UNIQUE, -- identificador de sesión
  total_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_carts_timestamp
BEFORE UPDATE ON carts
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  variacion_id UUID REFERENCES variaciones(id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1,
  price_at_addition DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at en cart_items
CREATE TRIGGER update_cart_items_timestamp
BEFORE UPDATE ON cart_items
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE SEQUENCE IF NOT EXISTS order_seq;
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE DEFAULT 'ORD-'||TO_CHAR(NOW(),'YYYYMMDD')||'-'||LPAD(nextval('order_seq')::TEXT,6,'0'),
  cart_id UUID REFERENCES carts(id),
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_name TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','cancelled')),
  mercadopago_preference_id TEXT UNIQUE,
  mercadopago_payment_id TEXT,
  payment_method TEXT,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  variacion_id UUID REFERENCES variaciones(id) ON DELETE RESTRICT,
  product_name TEXT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  -- Snapshots de variación
  variacion_size TEXT NOT NULL,
  variacion_color TEXT NOT NULL,
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  mercadopago_payment_id TEXT,
  status TEXT,
  status_detail TEXT,
  merchant_order_id TEXT,
  event_type TEXT,
  response_body JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de auditoría de cambios de estado de órdenes
CREATE TABLE order_status_history (
  order_id UUID REFERENCES orders(id),
  old_status TEXT,
  new_status TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para auditoría de cambios de estado en order_status_history
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO order_status_history(order_id, old_status, new_status, changed_at)
  VALUES(NEW.id, OLD.status, NEW.status, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_audit
AFTER UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- Índices para performance
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_variacion_id ON cart_items(variacion_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_mercadopago_preference_id ON orders(mercadopago_preference_id);
CREATE INDEX idx_payment_logs_order_id ON payment_logs(order_id);

-- RLS (Row Level Security)
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: acceso solo a carts por session_id
-- IMPORTANTE: debes setear la session_id en la conexión (app.session_id)
DROP POLICY IF EXISTS "Users can access their own cart" ON carts;
CREATE POLICY "Users can access their own cart" ON carts
  FOR ALL USING (session_id = current_setting('app.session_id', true));

-- RLS Policy para cart_items: solo acceso si el cart pertenece al usuario/sesión
DROP POLICY IF EXISTS "Access cart_items via cart" ON cart_items;
CREATE POLICY "Access cart_items via cart" ON cart_items
  FOR ALL USING (
    cart_id IN (
      SELECT id FROM carts 
      WHERE session_id = current_setting('app.session_id', true)
    )
  );

-- RLS Policy para orders: solo acceso si el cart pertenece al usuario/sesión
DROP POLICY IF EXISTS "Access orders via cart" ON orders;
CREATE POLICY "Access orders via cart" ON orders
  FOR ALL USING (
    cart_id IN (
      SELECT id FROM carts 
      WHERE session_id = current_setting('app.session_id', true)
    )
  );

-- RLS Policy para order_items: solo acceso si la order pertenece al usuario/sesión
DROP POLICY IF EXISTS "Access order_items via order" ON order_items;
CREATE POLICY "Access order_items via order" ON order_items
  FOR ALL USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE cart_id IN (
        SELECT id FROM carts WHERE session_id = current_setting('app.session_id', true)
      )
    )
  );

-- RLS Policy para payment_logs: solo acceso si la order pertenece al usuario/sesión
DROP POLICY IF EXISTS "Access payment_logs via order" ON payment_logs;
CREATE POLICY "Access payment_logs via order" ON payment_logs
  FOR ALL USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE cart_id IN (
        SELECT id FROM carts WHERE session_id = current_setting('app.session_id', true)
      )
    )
  );

-- Función para limpiar carritos expirados sin orden
CREATE OR REPLACE FUNCTION cleanup_expired_carts()
RETURNS void AS $$
BEGIN
  DELETE FROM carts 
  WHERE expires_at < NOW() 
  AND id NOT IN (SELECT cart_id FROM orders WHERE cart_id IS NOT NULL);
END;
$$ LANGUAGE plpgsql;