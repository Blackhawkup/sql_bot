# Vercel Deployment Guide

## Prerequisites

1. Vercel account
2. GitHub repository with your code
3. Neon PostgreSQL database
4. Azure OpenAI service

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository and click "Import"

### 2. Configure Environment Variables

In Vercel dashboard, go to Settings > Environment Variables and add:

```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-02-15-preview
JWT_SECRET_KEY=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
```

### 3. Update API URLs

After deployment, update the API URLs in:

- `src/api/chat.js`
- `src/api/admin.js`

Replace `https://your-vercel-app.vercel.app` with your actual Vercel URL.

### 4. Deploy

1. Click "Deploy" in Vercel dashboard
2. Wait for deployment to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## File Structure for Vercel

```
/
├── main.py                 # FastAPI app (moved from backend/)
├── requirements.txt        # Python dependencies
├── vercel.json            # Vercel configuration
├── package.json           # Node.js dependencies
├── dist/                  # Built frontend (auto-generated)
├── backend/               # Backend code
├── src/                   # Frontend source
└── public/                # Static assets
```

## Important Notes

- The backend runs as a Python serverless function
- The frontend is built and served as static files
- All API routes are proxied to the Python backend
- Environment variables are securely stored in Vercel
