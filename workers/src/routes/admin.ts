import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings } from '../index';
import { adminMiddleware } from '../middleware/auth';
import { createUser, deleteUser, getAllUsers, updateUserInfo, getUserById } from '../models/user';

export const adminRouter = new Hono<{ Bindings: Bindings }>();

const addUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  role: z.enum(['user', 'admin']).default('user'),
  schema: z.string().optional(),
  admin_schema: z.string().optional(),
});

const removeUserSchema = z.object({
  username: z.string(),
});

// Add user
adminRouter.post(
  '/add-user',
  adminMiddleware,
  zValidator('json', addUserSchema),
  async (c) => {
    const data = c.req.valid('json');
    const env = c.env;

    try {
      // Require schema for all users
      if (!data.schema || data.schema.trim() === '') {
        return c.json({ error: 'schema is required for user creation' }, 400);
      }

      const user = await createUser(
        env,
        data.username,
        data.password,
        data.role,
        data.schema,
        data.admin_schema
      );

      return c.json({ status: 'ok', id: user.id });
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  }
);

// Remove user
adminRouter.post(
  '/remove-user',
  adminMiddleware,
  zValidator('json', removeUserSchema),
  async (c) => {
    const { username } = c.req.valid('json');
    const env = c.env;

    try {
      const success = await deleteUser(env, username);
      if (!success) {
        return c.json({ error: 'User not found' }, 404);
      }
      return c.json({ status: 'ok' });
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  }
);

// Get all users
adminRouter.get('/users', adminMiddleware, async (c) => {
  const env = c.env;

  try {
    const users = await getAllUsers(env);
    return c.json({ status: 'ok', users });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update user
adminRouter.put('/users/:id', adminMiddleware, async (c) => {
  const env = c.env;
  const userId = parseInt(c.req.param('id'));
  const data = await c.req.json();

  try {
    const existingUser = await getUserById(env, userId);
    if (!existingUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedUser = await updateUserInfo(env, userId, data);
    return c.json({
      status: 'ok',
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
