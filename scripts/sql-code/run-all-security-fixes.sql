-- ============================================================================
-- RUN ALL SECURITY FIXES (ONE-SHOT) - SUPABASE
-- ============================================================================
-- This script applies all reported security remediations in one execution.
-- Safe to run more than once.

BEGIN;

-- ============================================================================
-- 1) RLS DISABLED IN PUBLIC (enable RLS + block direct client access)
-- ============================================================================

ALTER TABLE IF EXISTS public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhook_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhook_dead_letter ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhook_reconciliation_logs ENABLE ROW LEVEL SECURITY;

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
      EXECUTE format(
        'CREATE POLICY "Deny direct access" ON public.%I
         FOR ALL
         TO anon, authenticated
         USING (false)
         WITH CHECK (false);',
        table_name
      );
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- 2) RLS POLICY ALWAYS TRUE (consultas INSERT policy)
-- ============================================================================

DO $$
BEGIN
  IF to_regclass('public.consultas') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public insert consultas" ON public.consultas';

    EXECUTE '
      CREATE POLICY "Public insert consultas"
      ON public.consultas
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (auth.role() IN (''anon'', ''authenticated''))
    ';
  END IF;
END $$;

-- ============================================================================
-- 3) FUNCTION SEARCH PATH MUTABLE (set fixed search_path)
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
      'ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp;',
      fn.schema_name,
      fn.function_name,
      fn.args
    );
  END LOOP;
END $$;

COMMIT;

-- ============================================================================
-- 4) POST-RUN CHECKS (run manually if you want to validate immediately)
-- ============================================================================
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

-- SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'order_status_history',
--     'webhook_queue',
--     'webhook_dead_letter',
--     'webhook_reconciliation_logs',
--     'consultas'
--   )
-- ORDER BY tablename, policyname;

-- SELECT
--   n.nspname AS schema,
--   p.proname AS function,
--   pg_get_function_identity_arguments(p.oid) AS args,
--   array_to_string(p.proconfig, ', ') AS function_config
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND p.proname IN (
--     'update_timestamp',
--     'log_order_status_change',
--     'cleanup_expired_carts',
--     'update_webhook_queue_timestamp',
--     'update_webhook_dead_letter_timestamp'
--   )
-- ORDER BY function;
