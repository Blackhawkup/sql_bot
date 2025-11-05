import { Context, Next } from 'hono';
import type { Bindings } from '../index';
import { verifyToken } from '../utils/jwt';

export async function jwtMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verifyToken(c.env, token);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}

export async function adminMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  await jwtMiddleware(c, async () => {
    const user = c.get('user');
    if (user.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    await next();
  });
}
