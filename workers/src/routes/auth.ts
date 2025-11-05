import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings } from '../index';
import { createToken } from '../utils/jwt';
import { getUserByUsername, verifyPassword } from '../models/user';

export const authRouter = new Hono<{ Bindings: Bindings }>();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

authRouter.post(
  '/login',
  zValidator('json', loginSchema),
  async (c) => {
    const { username, password } = c.req.valid('json');
    const env = c.env;

    try {
      // Get user from database
      const user = await getUserByUsername(env, username);
      
      if (!user) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Verify password
      const isValid = await verifyPassword(username, password, user.password_hash);
      
      if (!isValid) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Create JWT token
      const token = await createToken(env, {
        sub: user.username,
        role: user.role,
      });

      return c.json({
        status: 'ok',
        token,
        username: user.username,
        role: user.role,
        schema: user.schema,
      });
    } catch (error) {
      console.error('Login error:', error);
      return c.json({ error: 'Login failed' }, 500);
    }
  }
);
