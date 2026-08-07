-- ============================================================================
-- ROLLBACK SECURITY FIXES (DEV ONLY)
-- ============================================================================
-- Use this script only in local/dev environments if you need to temporarily
-- revert the hardening changes applied by run-all-security-fixes.sql.
-- Catalog restart note: this is historical/dev-only SQL and is not part of the
-- current catalog deploy path.

BEGIN;

-- ============================================================================
-- 1) Remove restrictive policies from internal tables
-- ============================================================================

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'order_status_history',
    'webhook_queue',
    'webhook_dead_letter',
    'webhook_reconciliation_logs'
  ]
  LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS "Deny direct access" ON public.%I;', table_name);
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- 2) Disable RLS again on those internal tables (DEV behavior)
-- ============================================================================

ALTER TABLE IF EXISTS public.order_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhook_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhook_dead_letter DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhook_reconciliation_logs DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3) Restore consultas INSERT policy to original permissive version
-- ============================================================================

DO $$
BEGIN
  IF to_regclass('public.consultas') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public insert consultas" ON public.consultas';
    EXECUTE '
      CREATE POLICY "Public insert consultas"
      ON public.consultas
      FOR INSERT
      WITH CHECK (true)
    ';
  END IF;
END $$;

-- ============================================================================
-- 4) Reset function-level search_path settings
-- ============================================================================

DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'update_timestamp',
        'log_order_status_change',
        'cleanup_expired_carts',
        'update_webhook_queue_timestamp',
        'update_webhook_dead_letter_timestamp'
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) RESET search_path;',
      fn.schema_name,
      fn.function_name,
      fn.args
    );
  END LOOP;
END $$;

COMMIT;

-- Optional checks
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'order_status_history',
--     'webhook_queue',
--     'webhook_dead_letter',
--     'webhook_reconciliation_logs',
--     'consultas'
--   )
-- ORDER BY tablename;
