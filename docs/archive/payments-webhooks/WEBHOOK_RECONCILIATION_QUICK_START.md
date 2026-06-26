# Webhook Reconciliation - Quick Integration Guide

> Documento archivado.
> La referencia operativa vigente es [`../../WEBHOOK_SECURITY.md`](../../WEBHOOK_SECURITY.md).

**Estimated Integration Time:** 30 minutes  
**Complexity:** Medium  
**Production Ready:** YES ✅

---

## 🚀 Quick Start (5 steps)

### Step 1: Run Database Schema (5 min)

Execute this SQL in your Supabase SQL editor or psql:

```bash
# Historical note:
# the dedicated schema file is no longer present.
# use scripts/sql-code/README.md and scripts/sql-code/supabase.sql as current references.
```

This creates 3 new tables:

- `webhook_queue` - For pending webhook events
- `webhook_dead_letter` - For failed webhooks
- `webhook_reconciliation_logs` - For job tracking

### Step 2: Set Environment Variables (2 min)

Add to `.env.local`:

```bash
# Required for webhook reconciliation
WEBHOOK_RECONCILIATION_TOKEN=put-a-random-secret-here-min-32-chars
WEBHOOK_QUEUE_PROCESSOR_TOKEN=put-another-random-secret-min-32-chars
WEBHOOK_STATUS_TOKEN=put-another-random-secret-min-32-chars
CRON_SECRET=put-cron-secret-here
```

Generate random tokens:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Deploy Code (5 min)

```bash
git add .
git commit -m "feat: webhook reconciliation with queue processing"
git push origin staging
# Then merge to main and deploy
```

### Step 4: Test the System (10 min)

Check queue status:

```bash
curl -X GET https://yourdomain.com/api/webhooks/status \
  -H "Authorization: Bearer $WEBHOOK_STATUS_TOKEN"
```

Process queue manually:

```bash
curl -X POST https://yourdomain.com/api/webhooks/process-queue \
  -H "Authorization: Bearer $WEBHOOK_QUEUE_PROCESSOR_TOKEN"
```

### Step 5: Set Up Cron Job (5 min)

**For Vercel (Easiest):**

Update `vercel.json` or `package.json`:

```json
{
  "crons": [
    {
      "path": "/api/webhooks/reconcile",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/webhooks/process-queue",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**For Other Platforms:** See [full documentation](./WEBHOOK_RECONCILIATION_COMPLETE.md)

---

## 📊 What Changed

### Before

```
Webhook Request
    ↓
Process payment (slow)
    ↓
Update database (slow)
    ↓
Return 200 (slow)
    ↓
(Mercado Pago times out?)
```

### After

```
Webhook Request
    ↓
Validate & Enqueue (fast < 100ms)
    ↓
Return 200 IMMEDIATELY
    ↓
(Async processing in background)
    ├─ Success: Update order ✅
    ├─ Failure: Retry with exponential backoff
    └─ Max retries: Move to dead letter queue
```

---

## 📈 Monitoring Checklist

After deployment, monitor these:

```bash
# 1. Queue health
SELECT status, COUNT(*) as count FROM webhook_queue GROUP BY status;

# Expected: mostly "completed", few "pending"/"failed"

# 2. Dead letter queue
SELECT COUNT(*) as failed_webhooks FROM webhook_dead_letter WHERE status = 'pending';

# Expected: 0-2 per day (investigate if > 5)

# 3. Reconciliation success
SELECT status, COUNT(*) FROM webhook_reconciliation_logs
WHERE started_at > NOW() - INTERVAL '24 hours'
GROUP BY status;

# Expected: all "completed"
```

---

## 🔍 Troubleshooting

### "Unauthorized" Error on Status Endpoint

→ Check `WEBHOOK_STATUS_TOKEN` in request header

### Queue Events Not Processing

→ Ensure cron job is configured and running

### Dead Letter Queue Growing

→ Review error details, check Mercado Pago API status

### "Table Does Not Exist"

→ Consult `scripts/sql-code/README.md` y `scripts/sql-code/supabase.sql`

---

## 📚 Key Endpoints

```
POST /api/webhooks/reconcile          # Trigger reconciliation job
POST /api/webhooks/process-queue      # Process pending events
GET  /api/webhooks/status             # Get queue statistics
POST /api/checkout/webhook            # Original webhook receiver (no changes needed)
```

---

## ✅ Verification

After completing the 5 steps, verify:

- [ ] SQL schema executed without errors
- [ ] Environment variables set (3 tokens + cron secret)
- [ ] Code deployed to staging
- [ ] `GET /api/webhooks/status` returns 200
- [ ] `POST /api/webhooks/process-queue` returns stats
- [ ] Cron job configured
- [ ] Queue table has 0-10 pending events

---

## 🎓 How It Works (Simple Version)

1. **Webhook arrives** → Validated & queued (< 100ms)
2. **Return 200** → Mercado Pago happy (no timeout)
3. **Background process** → Handles actual order updates
4. **If fails** → Automatically retries (1, 2, 4, 8, 16, 32 min)
5. **After max retries** → Moves to dead letter (manual review)
6. **Hourly cleanup** → Archives old events, retries stuck ones

---

## 💡 Pro Tips

- Check `/api/webhooks/status` daily to monitor queue health
- Set up alerts if dead letter queue grows > 5 entries
- Review failed webhooks monthly for patterns
- Keep cron job running 24/7 (no manual intervention needed)

---

## 📖 For More Details

- Full implementation: [WEBHOOK_RECONCILIATION_COMPLETE.md](./WEBHOOK_RECONCILIATION_COMPLETE.md)
- API examples: See "API Endpoints" section in full doc
- Database reference: [scripts/sql-code/README.md](../../../scripts/sql-code/README.md)

---

**Status:** Ready to deploy! 🚀
