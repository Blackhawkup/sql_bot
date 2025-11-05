import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRouter } from './routes/auth';
import { chatRouter } from './routes/chat';
import { adminRouter } from './routes/admin';

// Environment bindings type
export type Bindings = {
  JWT_SECRET: string;
  POSTGRES_URL: string;
  AZURE_OPENAI_ENDPOINT: string;
  AZURE_OPENAI_KEY: string;
  HYPERDRIVE?: Hyperdrive;
  KV?: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

// Mount routers
app.route('/auth', authRouter);
app.route('/api', chatRouter);
app.route('/api/admin', adminRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: err.message || 'Internal Server Error' }, 500);
});

export default app;
