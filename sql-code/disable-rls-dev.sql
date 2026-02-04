-- DESARROLLO: Desactivar RLS temporalmente para testing
-- IMPORTANTE: Re-activar en producción

ALTER TABLE carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history DISABLE ROW LEVEL SECURITY;

-- Verificar estado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('carts', 'cart_items', 'orders', 'order_items', 'payment_logs', 'order_status_history');
