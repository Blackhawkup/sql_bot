# SQL Bot - Cloudflare Workers Backend

This is a Cloudflare Workers implementation of the SQL Bot backend using **Hono.js** framework.

## 🚀 Features

- **Serverless**: Runs on Cloudflare's global edge network
- **Fast**: Ultra-low latency worldwide
- **Scalable**: Auto-scales with traffic
- **Cost-effective**: Free tier includes 100k requests/day

## 📋 Prerequisites

1. **Cloudflare Account** - Sign up at https://dash.cloudflare.com
2. **Wrangler CLI** - Will be installed via npm
3. **Node.js 18+** - For development

## 🔧 Setup Instructions

### Step 1: Install Dependencies

```powershell
cd workers
npm install
```

### Step 2: Configure Cloudflare Account

Login to Cloudflare using Wrangler:

```powershell
npx wrangler login
```

This will open a browser window to authenticate with Cloudflare.

### Step 3: Set Up Hyperdrive (PostgreSQL Connection)

Cloudflare Workers cannot directly connect to PostgreSQL. You must use **Hyperdrive** to proxy connections to your Neon database.

#### Create Hyperdrive Configuration:

```powershell
npx wrangler hyperdrive create sql-bot-db --connection-string="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_NEON_HOST/neondb?sslmode=require"
```

Replace with your actual Neon connection string from the `.env` file.

This will output a Hyperdrive ID. Copy it.

#### Update wrangler.toml:

Uncomment and update the Hyperdrive binding in `wrangler.toml`:

```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "your-hyperdrive-id-from-above"
```

### Step 4: Set Environment Secrets

Set your secrets in Cloudflare (these are encrypted and not in code):

```powershell
npx wrangler secret put JWT_SECRET
# Enter your JWT secret when prompted

npx wrangler secret put POSTGRES_URL
# Enter your full PostgreSQL connection string

npx wrangler secret put AZURE_OPENAI_ENDPOINT
# Enter your Azure OpenAI endpoint

npx wrangler secret put AZURE_OPENAI_KEY
# Enter your Azure OpenAI API key
```

### Step 5: Local Development

Create a `.dev.vars` file for local development:

```powershell
copy .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your actual credentials.

Run the development server:

```powershell
npm run dev
```

This starts a local server at `http://localhost:8787`

### Step 6: Deploy to Production

Deploy your worker to Cloudflare's edge network:

```powershell
npm run deploy
```

After deployment, Wrangler will show your worker URL:

```
https://sql-bot-worker.YOUR_SUBDOMAIN.workers.dev
```

## 🔌 Important: Database Connection

### Option A: Using Hyperdrive (Recommended)

Hyperdrive is Cloudflare's database connector that pools connections and provides low latency.

**Pros:**

- Managed connection pooling
- Optimized for Workers
- Built-in caching
- Free tier available

**Setup:** See Step 3 above

### Option B: REST API Proxy

If Hyperdrive doesn't work for your setup, create a separate API endpoint that your Worker can call via HTTP.

## 📝 API Endpoints

Once deployed, your API will be available at:

- `POST /auth/login` - User authentication
- `POST /api/generate-sql` - Generate SQL from natural language
- `POST /api/run-query` - Execute SQL query
- `GET /api/chat-history` - Get chat history
- `POST /api/save-session` - Save chat session
- `GET /api/chat-sessions` - Get all sessions
- `GET /api/chat-session/:id` - Get specific session
- `DELETE /api/chat-session/:id` - Delete session
- `POST /api/admin/add-user` - Add user (admin only)
- `POST /api/admin/remove-user` - Remove user (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id` - Update user (admin only)
- `GET /health` - Health check
- `GET /api/test-db` - Test database connection

## 🌐 Update Frontend

After deployment, update your frontend API base URL in `src/api/index.js`:

```javascript
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sql-bot-worker.YOUR_SUBDOMAIN.workers.dev"
    : "http://localhost:8787";
```

## 📊 Monitoring

View logs in real-time:

```powershell
npm run tail
```

Or visit the Cloudflare Dashboard:
https://dash.cloudflare.com → Workers & Pages → sql-bot-worker

## 🔐 Security Notes

1. **Never commit `.dev.vars`** - It contains secrets
2. **Use `wrangler secret`** for production secrets
3. **Enable CORS** properly for your frontend domain
4. **Rate limiting** is built-in to prevent abuse

## 💰 Pricing

Cloudflare Workers Free Tier:

- 100,000 requests/day
- 10ms CPU time per request
- 128MB memory

Paid Plan ($5/month):

- 10 million requests/month (then $0.50/million)
- 50ms CPU time per request
- 128MB memory

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

- Verify Hyperdrive is configured correctly
- Check your POSTGRES_URL secret
- Ensure Neon database allows connections
- Check Hyperdrive status in Cloudflare Dashboard

### Error: "Module not found"

- Run `npm install` in the workers directory
- Make sure `node_modules` exists

### Error: "Invalid authentication"

- Verify JWT_SECRET is set in production
- Check that token is being sent in Authorization header

### Local dev not working

- Make sure `.dev.vars` file exists with all required variables
- Try `npx wrangler dev` instead of `npm run dev`

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Hono.js Documentation](https://hono.dev/)
- [Hyperdrive Documentation](https://developers.cloudflare.com/hyperdrive/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## 🔄 Migration from Vercel/Railway

This Workers implementation is a drop-in replacement for your FastAPI backend. The API endpoints are identical, so your frontend requires no changes except updating the API base URL.

### Benefits over Vercel/Railway:

1. **Global Edge Network**: Lower latency worldwide
2. **No Cold Starts**: Workers stay warm
3. **Generous Free Tier**: 100k requests/day
4. **Built-in DDoS Protection**: Cloudflare's security
5. **Auto-scaling**: Handles traffic spikes automatically
