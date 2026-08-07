-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
-- Catalog restart note: this snapshot is mixed. It includes catalog/contact
-- objects and historical e-commerce objects removed from the executable app.
-- Do not run it as a catalog deploy migration.

CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cart_id uuid,
  variacion_id uuid,
  quantity integer NOT NULL DEFAULT 1,
  price_at_addition numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id),
  CONSTRAINT cart_items_variacion_id_fkey FOREIGN KEY (variacion_id) REFERENCES public.variaciones(id)
);
CREATE TABLE public.carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text UNIQUE,
  total_amount numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
  CONSTRAINT carts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categorias (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  descripcion text,
  orden integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  imagen text,
  featured boolean DEFAULT false,
  CONSTRAINT categorias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.consultas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre character varying NOT NULL,
  email character varying NOT NULL,
  telefono character varying,
  producto_id uuid,
  variacion_id uuid,
  mensaje text NOT NULL,
  estado character varying DEFAULT 'nueva'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT consultas_pkey PRIMARY KEY (id),
  CONSTRAINT consultas_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id),
  CONSTRAINT consultas_variacion_id_fkey FOREIGN KEY (variacion_id) REFERENCES public.variaciones(id)
);
CREATE TABLE public.imagenes_producto (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  producto_id uuid,
  url text NOT NULL,
  alt_text character varying,
  orden integer DEFAULT 0,
  es_principal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT imagenes_producto_pkey PRIMARY KEY (id),
  CONSTRAINT imagenes_producto_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  variacion_id uuid,
  product_name text,
  quantity integer NOT NULL,
  unit_price numeric,
  subtotal numeric,
  variacion_size text NOT NULL,
  variacion_color text NOT NULL,
  sku text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_variacion_id_fkey FOREIGN KEY (variacion_id) REFERENCES public.variaciones(id)
);
CREATE TABLE public.order_status_history (
  order_id uuid,
  old_status text,
  new_status text,
  changed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text DEFAULT ((('ORD-'::text || to_char(now(), 'YYYYMMDD'::text)) || '-'::text) || lpad((nextval('order_seq'::regclass))::text, 6, '0'::text)) UNIQUE,
  cart_id uuid,
  customer_email text NOT NULL,
  customer_phone text,
  customer_name text,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'paid'::text, 'shipped'::text, 'cancelled'::text, 'rejected'::text])),
  mercadopago_preference_id text UNIQUE,
  mercadopago_payment_id text,
  payment_method text,
  shipping_address text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id)
);
CREATE TABLE public.payment_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  mercadopago_payment_id text,
  status text,
  status_detail text,
  merchant_order_id text,
  event_type text,
  response_body jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_logs_pkey PRIMARY KEY (id),
  CONSTRAINT payment_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.productos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  descripcion text NOT NULL,
  categoria_id uuid,
  precio_desde numeric,
  destacado boolean DEFAULT false,
  activo boolean DEFAULT true,
  tiempo_fabricacion character varying DEFAULT '3-5 días hábiles'::character varying,
  material text,
  cuidados text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT productos_pkey PRIMARY KEY (id),
  CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id)
);
CREATE TABLE public.variaciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  producto_id uuid,
  tamanio character varying NOT NULL,
  color character varying NOT NULL,
  precio numeric NOT NULL,
  stock integer DEFAULT 0,
  sku character varying UNIQUE,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT variaciones_pkey PRIMARY KEY (id),
  CONSTRAINT variaciones_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);
CREATE TABLE public.webhook_dead_letter (
  id bigint NOT NULL DEFAULT nextval('webhook_dead_letter_id_seq'::regclass),
  webhook_queue_id bigint NOT NULL,
  payment_id character varying NOT NULL,
  event_type character varying NOT NULL,
  webhook_data jsonb NOT NULL,
  total_attempts integer NOT NULL,
  final_error text NOT NULL,
  error_details jsonb,
  status character varying DEFAULT 'pending'::character varying,
  review_notes text,
  moved_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  reviewed_at timestamp without time zone,
  resolved_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT webhook_dead_letter_pkey PRIMARY KEY (id),
  CONSTRAINT webhook_dead_letter_webhook_queue_id_fkey FOREIGN KEY (webhook_queue_id) REFERENCES public.webhook_queue(id)
);
CREATE TABLE public.webhook_queue (
  id bigint NOT NULL DEFAULT nextval('webhook_queue_id_seq'::regclass),
  payment_id character varying NOT NULL,
  event_type character varying NOT NULL,
  webhook_data jsonb NOT NULL,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 5,
  first_attempt_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  last_attempt_at timestamp without time zone,
  next_retry_at timestamp without time zone,
  completed_at timestamp without time zone,
  last_error text,
  error_details jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT webhook_queue_pkey PRIMARY KEY (id)
);
CREATE TABLE public.webhook_reconciliation_logs (
  id bigint NOT NULL DEFAULT nextval('webhook_reconciliation_logs_id_seq'::regclass),
  job_id character varying NOT NULL UNIQUE,
  started_at timestamp without time zone NOT NULL,
  completed_at timestamp without time zone,
  queue_processed integer DEFAULT 0,
  queue_failed integer DEFAULT 0,
  dead_letter_reviewed integer DEFAULT 0,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  error text,
  duration_ms integer,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT webhook_reconciliation_logs_pkey PRIMARY KEY (id)
);
