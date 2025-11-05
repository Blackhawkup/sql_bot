# 🚀 Complete Cloudflare Workers Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Database Configuration](#database-configuration)
5. [Deployment](#deployment)
6. [Frontend Integration](#frontend-integration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ **Cloudflare Account** (free) - [Sign up here](https://dash.cloudflare.com/sign-up)
- ✅ **Node.js 18+** installed
- ✅ **Neon PostgreSQL database** (you already have this)
- ✅ **Azure OpenAI credentials** (you already have this)

---

## Quick Start

### 1. Install Dependencies

Open PowerShell and navigate to the workers directory:

\`\`\`powershell
cd c:\\Computer\\Coding\\sql-bot\\sql_bot\\workers
npm install
\`\`\`

This will install:
- `hono` - Web framework for Workers
- `@hono/zod-validator` - Request validation
- `zod` - Schema validation
- `bcryptjs` - Password hashing
- `wrangler` - Cloudflare CLI tool
- `@cloudflare/workers-types` - TypeScript types

### 2. Login to Cloudflare

\`\`\`powershell
npx wrangler login
\`\`\`

This opens your browser for authentication. Click **"Allow"** to grant access.

### 3. Create Hyperdrive Connection

**CRITICAL:** Workers cannot directly connect to PostgreSQL. You MUST use Hyperdrive.

First, get your Neon connection string from `../.env`:

\`\`\`powershell
# Example format:
# postgresql://neondb_owner:YOUR_PASSWORD@ep-snowy-recipe-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
\`\`\`

Create Hyperdrive:

\`\`\`powershell
npx wrangler hyperdrive create sql-bot-db --connection-string="YOUR_FULL_NEON_CONNECTION_STRING"
\`\`\`

**Save the Hyperdrive ID** that's printed (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### 4. Update wrangler.toml

Edit `wrangler.toml` and uncomment the Hyperdrive section:

\`\`\`toml
# Uncomment and add your Hyperdrive ID:
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "YOUR_HYPERDRIVE_ID_FROM_STEP_3"
\`\`\`

### 5. Set Production Secrets

\`\`\`powershell
# JWT Secret (use the same one from your .env file)
npx wrangler secret put JWT_SECRET
# When prompted, paste: your-secret-key-here

# PostgreSQL URL (your full Neon connection string)
npx wrangler secret put POSTGRES_URL
# When prompted, paste: postgresql://neondb_owner:...

# Azure OpenAI Endpoint
npx wrangler secret put AZURE_OPENAI_ENDPOINT
# When prompted, paste: https://your-resource.openai.azure.com

# Azure OpenAI Key
npx wrangler secret put AZURE_OPENAI_KEY
# When prompted, paste: your-azure-key-here
\`\`\`

### 6. Test Locally (Optional)

Create `.dev.vars` file:

\`\`\`powershell
copy .dev.vars.example .dev.vars
notepad .dev.vars
\`\`\`

Fill in your credentials, then run:

\`\`\`powershell
npm run dev
\`\`\`

Test at `http://localhost:8787/health`

### 7. Deploy to Production

\`\`\`powershell
npm run deploy
\`\`\`

✅ **Done!** Your worker is live at: `https://sql-bot-worker.YOUR_SUBDOMAIN.workers.dev`

---

## Detailed Setup

### Understanding the Architecture

**Original Backend (FastAPI)**
```
Frontend → Vercel/Railway → FastAPI → PostgreSQL
                ↓
           Azure OpenAI
```

**New Workers Backend (Hono.js)**
```
Frontend → Cloudflare Edge → Hono Worker → Hyperdrive → PostgreSQL
                ↓
           Azure OpenAI
```

### Why Cloudflare Workers?

1. **Global CDN**: Your API runs on 300+ data centers worldwide
2. **No Cold Starts**: Unlike Vercel Functions, Workers stay warm
3. **Free Tier**: 100,000 requests/day (vs Vercel's 5GB bandwidth)
4. **Better Performance**: Runs at the edge, closer to users
5. **Built-in DDoS Protection**: Cloudflare's security layer

---

## Database Configuration

### Understanding Hyperdrive

Cloudflare Workers cannot make direct TCP connections to databases. Hyperdrive is a connection pooler that:

- ✅ Manages PostgreSQL connections
- ✅ Provides connection pooling
- ✅ Caches query results
- ✅ Works with Neon, AWS RDS, any PostgreSQL

### Setup Hyperdrive Step-by-Step

1. **Find your Neon connection string**:
   \`\`\`powershell
   # In your .env file, look for:
   POSTGRES_URL=postgresql://neondb_owner:npg_xxx@ep-xxx.neon.tech/neondb?sslmode=require
   \`\`\`

2. **Create Hyperdrive**:
   \`\`\`powershell
   npx wrangler hyperdrive create sql-bot-db --connection-string="postgresql://neondb_owner:PASSWORD@HOST/DATABASE?sslmode=require"
   \`\`\`

3. **Note the output**:
   \`\`\`
   Successfully created a new Hyperdrive configuration!
   
   [[hyperdrive]]
   binding = "HYPERDRIVE"
   id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
   \`\`\`

4. **Add to wrangler.toml**:
   \`\`\`toml
   [[hyperdrive]]
   binding = "HYPERDRIVE"
   id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"  # Your ID here
   \`\`\`

### Verify Hyperdrive

\`\`\`powershell
npx wrangler hyperdrive list
\`\`\`

Should show your `sql-bot-db` configuration.

---

## Deployment

### Step 1: Build Check

\`\`\`powershell
cd c:\\Computer\\Coding\\sql-bot\\sql_bot\\workers
npm install
\`\`\`

Verify no errors in TypeScript:

\`\`\`powershell
npx tsc --noEmit
\`\`\`

### Step 2: Deploy

\`\`\`powershell
npm run deploy
\`\`\`

You'll see output like:

\`\`\`
⛅️ wrangler 3.22.1
------------------
Your worker has been deployed!
📎 https://sql-bot-worker.YOUR_SUBDOMAIN.workers.dev
\`\`\`

### Step 3: Test Deployment

Test the health endpoint:

\`\`\`powershell
curl https://sql-bot-worker.YOUR_SUBDOMAIN.workers.dev/health
\`\`\`

Expected response:
\`\`\`json
{"status":"ok","timestamp":1234567890}
\`\`\`

Test database connection:

\`\`\`powershell
curl https://sql-bot-worker.YOUR_SUBDOMAIN.workers.dev/api/test-db
\`\`\`

---

## Frontend Integration

### Update API Base URL

Edit `src/api/index.js`:

\`\`\`javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://sql-bot-worker.YOUR_SUBDOMAIN.workers.dev'  // ← Update this
  : 'http://localhost:8787';  // For local worker development

export default API_BASE_URL;
\`\`\`

### Rebuild Frontend

\`\`\`powershell
cd c:\\Computer\\Coding\\sql-bot\\sql_bot
npm run build
\`\`\`

### Deploy Frontend

If using Vercel for frontend only:

\`\`\`powershell
vercel --prod
\`\`\`

The frontend now talks to your Cloudflare Worker backend!

---

## Testing

### 1. Test Authentication

\`\`\`powershell
curl -X POST https://sql-bot-worker.YOUR_SUBDOMAIN.workers.dev/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"your-password"}'
\`\`\`

Expected:
\`\`\`json
{
  "status": "ok",
  "token": "eyJhbGc...",
  "username": "admin",
  "role": "admin"
}
\`\`\`

### 2. Test SQL Generation

\`\`\`powershell
$token = "YOUR_TOKEN_FROM_ABOVE"

curl -X POST https://sql-bot-worker.YOUR_SUBDOMAIN.workers.dev/api/generate-sql `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"prompt":"Show me all users"}'
\`\`\`

### 3. Monitor Logs

In a separate PowerShell window:

\`\`\`powershell
cd c:\\Computer\\Coding\\sql-bot\\sql_bot\\workers
npm run tail
\`\`\`

This shows real-time logs from your Worker.

---

## Troubleshooting

### Issue: "Cannot find module 'hono'"

**Solution:**
\`\`\`powershell
cd c:\\Computer\\Coding\\sql-bot\\sql_bot\\workers
rm -r node_modules
rm package-lock.json
npm install
\`\`\`

### Issue: "Hyperdrive binding not found"

**Cause:** Hyperdrive not configured in wrangler.toml

**Solution:**
1. Run `npx wrangler hyperdrive list`
2. Copy your Hyperdrive ID
3. Add to `wrangler.toml`:
   \`\`\`toml
   [[hyperdrive]]
   binding = "HYPERDRIVE"
   id = "YOUR_ID_HERE"
   \`\`\`

### Issue: "Database connection failed"

**Check list:**
- ✅ Hyperdrive is created: `npx wrangler hyperdrive list`
- ✅ POSTGRES_URL secret is set: `npx wrangler secret list`
- ✅ Neon database is online (check Neon dashboard)
- ✅ Connection string is correct (test with `psql` or pgAdmin)

### Issue: "401 Unauthorized"

**Cause:** JWT_SECRET not set or mismatched

**Solution:**
\`\`\`powershell
npx wrangler secret put JWT_SECRET
# Enter the SAME secret from your .env file
\`\`\`

### Issue: "Azure OpenAI timeout"

**Solution:**
- Verify endpoint and key are correct
- Check Azure OpenAI deployment is active
- Test endpoint directly:
  \`\`\`powershell
  curl -X POST "YOUR_ENDPOINT/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-06-01" `
    -H "api-key: YOUR_KEY" `
    -H "Content-Type: application/json" `
    -d '{"messages":[{"role":"user","content":"Hi"}]}'
  \`\`\`

### Issue: "Worker exceeds 10ms CPU time"

**Cause:** Free tier has 10ms CPU limit per request

**Solutions:**
1. Optimize database queries (add indexes)
2. Use KV caching for repeated queries
3. Upgrade to paid Workers plan ($5/month = 50ms CPU time)

### Check Worker Status

View in Cloudflare Dashboard:
1. Go to https://dash.cloudflare.com
2. Click **Workers & Pages**
3. Click **sql-bot-worker**
4. View metrics, logs, and errors

---

## Advanced Configuration

### Custom Domain

Instead of `xxx.workers.dev`, use your own domain:

1. Add domain to Cloudflare
2. In Workers dashboard, click **Triggers** → **Add Custom Domain**
3. Enter: `api.yourdomain.com`

### Environment Variables (Non-Secret)

For non-sensitive config, use `[vars]` in `wrangler.toml`:

\`\`\`toml
[vars]
ENVIRONMENT = "production"
MAX_QUERY_ROWS = "1000"
\`\`\`

### Rate Limiting

Built-in rate limiting is already configured in the code. To customize:

Edit `src/routes/chat.ts` - adjust the `@limiter.limit()` values.

### Caching with KV

To add caching:

1. Create KV namespace:
   \`\`\`powershell
   npx wrangler kv:namespace create KV
   \`\`\`

2. Add to `wrangler.toml`:
   \`\`\`toml
   [[kv_namespaces]]
   binding = "KV"
   id = "YOUR_KV_ID"
   \`\`\`

3. Use in code:
   \`\`\`typescript
   // Cache query results
   await env.KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
   \`\`\`

---

## Cost Analysis

### Free Tier (Sufficient for most projects)
- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request
- ✅ 128MB memory
- ✅ Unlimited bandwidth

**Realistic capacity:**
- ~3 million requests/month
- 300 concurrent users
- Sub-100ms response times worldwide

### Paid Tier ($5/month)
- ✅ 10 million requests/month (then $0.50/million)
- ✅ 50ms CPU time per request
- ✅ 128MB memory
- ✅ Better for AI/database-heavy operations

### Cost Comparison

| Platform | Free Tier | Paid | Performance |
|----------|-----------|------|-------------|
| **Cloudflare Workers** | 100k req/day | $5/mo | ⚡ Excellent |
| Vercel | 100 GB-hrs | $20/mo | 🟡 Good |
| Railway | $5 free credit | $5/mo | 🟢 Good |

---

## Next Steps

1. ✅ Deploy worker following this guide
2. ✅ Update frontend API URL
3. ✅ Test all endpoints
4. ✅ Monitor logs for 24 hours
5. ✅ Set up custom domain (optional)
6. ✅ Configure alerts in Cloudflare dashboard

---

## Support & Resources

- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Hono.js Docs**: https://hono.dev/
- **Hyperdrive Docs**: https://developers.cloudflare.com/hyperdrive/
- **Cloudflare Discord**: https://discord.gg/cloudflaredev

---

## Summary Checklist

Before going live, verify:

- [ ] Dependencies installed (`npm install`)
- [ ] Logged into Cloudflare (`npx wrangler login`)
- [ ] Hyperdrive created and configured
- [ ] All secrets set (`npx wrangler secret list`)
- [ ] Worker deployed (`npm run deploy`)
- [ ] Health endpoint responds (`/health`)
- [ ] Database connection works (`/api/test-db`)
- [ ] Authentication works (`/auth/login`)
- [ ] Frontend updated with new API URL
- [ ] Frontend rebuilt and deployed

**Congratulations! Your SQL Bot is now running on Cloudflare's global edge network! 🎉**
