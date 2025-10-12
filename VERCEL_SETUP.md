# Vercel Setup Guide - Result Code Retrieval

## Problem
The result code retrieval feature requires persistent storage to work across devices and browser sessions. On Vercel, you need to configure either **Supabase** or **Upstash Redis**.

## Option 1: Supabase (Recommended)

### 1. Create Supabase Project
- Go to https://supabase.com
- Create a free account and new project
- Wait for project to be provisioned

### 2. Create the Table
Run this SQL in Supabase SQL Editor:

```sql
CREATE TABLE gz_runs (
  hash TEXT PRIMARY KEY,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gz_runs_created ON gz_runs(created_at);
```

### 3. Get Your Credentials
- Go to Project Settings → API
- Copy:
  - **URL** (under Project URL)
  - **service_role** key (under Project API keys - keep this secret!)

### 4. Add to Vercel Environment Variables
In your Vercel project dashboard:
- Go to Settings → Environment Variables
- Add:
  ```
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```

### 5. Redeploy
- Go to Deployments
- Click "..." on latest deployment
- Click "Redeploy"

---

## Option 2: Upstash Redis (Alternative)

### 1. Create Upstash Account
- Go to https://upstash.com
- Create free account
- Create new Redis database (choose region close to your Vercel deployment)

### 2. Get Credentials
- Click on your database
- Copy:
  - **UPSTASH_REDIS_REST_URL**
  - **UPSTASH_REDIS_REST_TOKEN**

### 3. Add to Vercel Environment Variables
```
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### 4. Redeploy

---

## Testing

After setup and redeployment:
1. Take the assessment
2. Copy your result code
3. Open in incognito/different browser
4. Use menu → Retrieve Results
5. Paste code - should now work! ✅

---

## Current Behavior Without Database

- ✅ Works: Viewing results immediately after taking assessment (same browser)
- ✅ Works: Result code is generated and displayed
- ❌ Doesn't work: Retrieving results from different device/browser
- ❌ Doesn't work: Retrieving results after clearing browser data

## Cost

- **Supabase Free Tier**: 500MB database, 2GB bandwidth/month
- **Upstash Free Tier**: 10,000 commands/day
- Both are sufficient for this use case

