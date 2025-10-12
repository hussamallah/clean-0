# Supabase Database Queries

## Check if Results are Being Saved

Run these SQL queries in Supabase SQL Editor to verify your data:

### 1. Count Total Saved Results
```sql
SELECT COUNT(*) as total_results FROM gz_runs;
```

### 2. View Recent Results (Last 10)
```sql
SELECT 
  hash,
  created_at,
  jsonb_array_length(results) as num_domains
FROM gz_runs
ORDER BY created_at DESC
LIMIT 10;
```

### 3. View All Result Codes and Timestamps
```sql
SELECT 
  hash as result_code,
  created_at as saved_at,
  (results->0->>'domain') as first_domain
FROM gz_runs
ORDER BY created_at DESC;
```

### 4. View Complete Data for a Specific Result
```sql
SELECT * FROM gz_runs 
WHERE hash = 'your-result-code-here'
LIMIT 1;
```

### 5. Check Results from Today
```sql
SELECT 
  hash,
  created_at,
  jsonb_pretty(results) as assessment_data
FROM gz_runs
WHERE created_at >= CURRENT_DATE
ORDER BY created_at DESC;
```

### 6. Delete Old Results (Optional - Clean up test data)
```sql
-- Delete results older than 30 days
DELETE FROM gz_runs 
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## Troubleshooting: No Data?

If you don't see any data in `gz_runs` table:

### Check 1: Does the table exist?
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'gz_runs';
```

**If empty:** Run the table creation SQL from VERCEL_SETUP.md

### Check 2: Are environment variables set in Vercel?
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Verify these exist:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Check 3: Test the API endpoint
Try this in your browser (replace with your Vercel domain):
```
https://your-app.vercel.app/api/runs
```

Should return an error (it requires POST), but confirms the endpoint exists.

### Check 4: Check Vercel Function Logs
- Go to Vercel Dashboard → Your Project → Deployments
- Click on latest deployment
- Click "Functions" tab
- Look for `/api/runs` and `/api/who/[rid]` logs
- Look for errors related to Supabase connection

---

## Setting Up Row Level Security (Optional but Recommended)

If you want to secure your data:

```sql
-- Enable RLS on the table
ALTER TABLE gz_runs ENABLE ROW LEVEL SECURITY;

-- Allow public reads (so users can retrieve their results)
CREATE POLICY "Allow public reads" ON gz_runs
  FOR SELECT
  USING (true);

-- Allow service role to insert/update (your API)
CREATE POLICY "Allow service role writes" ON gz_runs
  FOR ALL
  USING (auth.role() = 'service_role');
```

---

## Useful Queries for Analytics

### Most Common Archetypes
```sql
SELECT 
  results->>-1->'payload'->>'winner' as archetype,
  COUNT(*) as count
FROM gz_runs
WHERE jsonb_array_length(results) > 5
GROUP BY archetype
ORDER BY count DESC;
```

### Results by Day
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as assessments_completed
FROM gz_runs
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

