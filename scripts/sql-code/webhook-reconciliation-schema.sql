-- Webhook Queue Table
-- Stores incoming webhook events for asynchronous processing
CREATE TABLE IF NOT EXISTS webhook_queue (
  id BIGSERIAL PRIMARY KEY,
  
  -- Webhook Event Data
  payment_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'payment.created', 'payment.updated'
  webhook_data JSONB NOT NULL,
  
  -- Processing State
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 5,
  
  -- Timing
  first_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_attempt_at TIMESTAMP,
  next_retry_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Error Context
  last_error TEXT,
  error_details JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

  -- Indexes for efficient querying
  -- UNIQUE constraint moved to partial unique index below
);

  -- Partial unique index for pending payments
  CREATE UNIQUE INDEX unique_pending_payment
  ON webhook_queue (payment_id, event_type)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_webhook_queue_status ON webhook_queue(status);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_next_retry ON webhook_queue(next_retry_at) WHERE status = 'pending' OR status = 'failed';
CREATE INDEX IF NOT EXISTS idx_webhook_queue_payment_id ON webhook_queue(payment_id);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_created_at ON webhook_queue(created_at DESC);

-- Webhook Dead Letter Queue
-- Stores webhook events that failed after max retries
CREATE TABLE IF NOT EXISTS webhook_dead_letter (
  id BIGSERIAL PRIMARY KEY,
  
  -- Original Queue Entry
  webhook_queue_id BIGINT NOT NULL REFERENCES webhook_queue(id) ON DELETE CASCADE,
  
  -- Payment & Event Data
  payment_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  webhook_data JSONB NOT NULL,
  
  -- Failure Information
  total_attempts INT NOT NULL,
  final_error TEXT NOT NULL,
  error_details JSONB,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, resolved, archived
  review_notes TEXT,
  
  -- Timestamps
  moved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_dead_letter_payment_id ON webhook_dead_letter(payment_id);
CREATE INDEX IF NOT EXISTS idx_webhook_dead_letter_status ON webhook_dead_letter(status);
CREATE INDEX IF NOT EXISTS idx_webhook_dead_letter_moved_at ON webhook_dead_letter(moved_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_dead_letter_queue_id ON webhook_dead_letter(webhook_queue_id);

-- Webhook Reconciliation Log
-- Tracks hourly reconciliation jobs
CREATE TABLE IF NOT EXISTS webhook_reconciliation_logs (
  id BIGSERIAL PRIMARY KEY,
  
  -- Job Execution
  job_id VARCHAR(255) NOT NULL UNIQUE,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  
  -- Processing Stats
  queue_processed INT DEFAULT 0,
  queue_failed INT DEFAULT 0,
  dead_letter_reviewed INT DEFAULT 0,
  
  -- Error Handling
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, completed, failed, partial
  error TEXT,
  
  -- Timing
  duration_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_reconciliation_logs_job_id ON webhook_reconciliation_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_webhook_reconciliation_logs_started_at ON webhook_reconciliation_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_reconciliation_logs_status ON webhook_reconciliation_logs(status);

-- Update Webhook Queue Timestamps Trigger
CREATE OR REPLACE FUNCTION update_webhook_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS webhook_queue_update_timestamp ON webhook_queue;
CREATE TRIGGER webhook_queue_update_timestamp
BEFORE UPDATE ON webhook_queue
FOR EACH ROW
EXECUTE FUNCTION update_webhook_queue_timestamp();

-- Update Webhook Dead Letter Timestamp Trigger
CREATE OR REPLACE FUNCTION update_webhook_dead_letter_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS webhook_dead_letter_update_timestamp ON webhook_dead_letter;
CREATE TRIGGER webhook_dead_letter_update_timestamp
BEFORE UPDATE ON webhook_dead_letter
FOR EACH ROW
EXECUTE FUNCTION update_webhook_dead_letter_timestamp();
