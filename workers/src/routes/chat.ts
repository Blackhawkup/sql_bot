import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Bindings } from '../index';
import { jwtMiddleware } from '../middleware/auth';
import { generateSQL } from '../services/azure-openai';
import { runQuery, testConnection } from '../services/database';
import { 
  getUserByUsername, 
  logChatMessage, 
  logQuery, 
  getChatMessages,
  saveChatSession,
  getChatSessions,
  getChatSession,
  deleteChatSession
} from '../models/user';

export const chatRouter = new Hono<{ Bindings: Bindings }>();

const generateSqlSchema = z.object({
  prompt: z.string(),
  schema: z.string().optional(),
});

const runQuerySchema = z.object({
  sql: z.string(),
  limit: z.number().optional(),
});

// Validate SQL is SELECT only
function validateSqlIsSelect(sql: string): boolean {
  console.log('===== VALIDATION DEBUG =====');
  console.log('Raw SQL input:', sql);
  console.log('SQL type:', typeof sql);
  
  const cleaned = sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
  
  console.log('Cleaned SQL:', cleaned);
  
  const firstToken = cleaned.split(/\s+/)[0]?.toLowerCase();
  console.log('First token:', firstToken);
  console.log('Is SELECT:', firstToken === 'select');
  console.log('===========================');
  
  return firstToken === 'select';
}

// Generate SQL endpoint
chatRouter.post(
  '/generate-sql',
  jwtMiddleware,
  zValidator('json', generateSqlSchema),
  async (c) => {
    const { prompt } = c.req.valid('json');
    const user = c.get('user');
    const env = c.env;

    try {
      const username = user.sub;
      
      // Get user from database to access their schema
      const dbUser = await getUserByUsername(env, username);
      
      if (!dbUser) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Get appropriate schema (admin_schema for admins, otherwise regular schema)
      const userSchema = dbUser.role === 'admin' && dbUser.admin_schema
        ? dbUser.admin_schema
        : dbUser.schema;

      // Check if user has a schema
      if (!userSchema || userSchema.trim() === '') {
        await logChatMessage(env, username, 'user', prompt);
        await logChatMessage(
          env,
          username,
          'assistant',
          'Please contact your administrator to upload a database schema before using the chat.'
        );
        return c.json({
          error: 'Please contact your administrator to upload a database schema.',
        }, 400);
      }

      // Log user message
      await logChatMessage(env, username, 'user', prompt);

      // Generate SQL using Azure OpenAI
      let sql: string;
      try {
        sql = await generateSQL(env, prompt, userSchema);
        console.log('===== SQL GENERATION DEBUG =====');
        console.log('Generated SQL:', sql);
        console.log('SQL type:', typeof sql);
        console.log('SQL length:', sql?.length);
        console.log('SQL bytes:', new TextEncoder().encode(sql));
        console.log('================================');
      } catch (error: any) {
        if (error.message?.includes('I_CANNOT_GENERATE_SQL')) {
          await logChatMessage(
            env,
            username,
            'assistant',
            'Your query is either unrelated to your database schema or references tables/columns that do not exist. Please ask about the specific tables and columns in your schema.'
          );
          return c.json({
            error: 'Your query is either unrelated to your database schema or references tables/columns that do not exist. Please ask about the specific tables and columns in your schema.',
          }, 400);
        }
        throw error;
      }

      // Validate SQL is SELECT only
      console.log('Validating SQL:', sql);
      const isValid = validateSqlIsSelect(sql);
      console.log('Is valid SELECT:', isValid);
      if (!isValid) {
        await logChatMessage(
          env,
          username,
          'assistant',
          'Generated SQL is not a SELECT. For safety only SELECT queries are allowed.'
        );
        
        // Return the generated SQL in the error for debugging
        return c.json({
          error: 'Only SELECT queries are allowed for safety.',
          debug_sql: sql,
          debug_info: 'The AI generated a non-SELECT query. Check the logs.'
        }, 400);
      }

      // Log assistant response with generated SQL
      await logChatMessage(
        env,
        username,
        'assistant',
        `Here is a proposed SQL query: ${sql}`,
        sql
      );

      return c.json({
        sql,
        explain: 'SQL generated based on your database schema',
      });
    } catch (error: any) {
      console.error('Generate SQL error:', error);
      return c.json({ error: error.message || 'Failed to generate SQL' }, 500);
    }
  }
);

// Run query endpoint
chatRouter.post(
  '/run-query',
  jwtMiddleware,
  zValidator('json', runQuerySchema),
  async (c) => {
    const { sql, limit } = c.req.valid('json');
    const user = c.get('user');
    const env = c.env;

    try {
      const username = user.sub;

      // Validate SQL is SELECT only
      if (!validateSqlIsSelect(sql)) {
        await logQuery(env, username, sql, 'error', 0, 'Non-SELECT query rejected');
        return c.json({
          error: 'Only SELECT queries are allowed for safety',
        }, 400);
      }

      // Execute query
      const rows = await runQuery(env, sql, limit);

      // Log successful query
      await logQuery(env, username, sql, 'ok', rows.length);

      return c.json({
        status: 'ok',
        rows,
      });
    } catch (error: any) {
      const username = user.sub;
      await logQuery(env, username, sql, 'error', 0, error.message);
      return c.json({ error: error.message || 'Query failed' }, 500);
    }
  }
);

// Get chat history
chatRouter.get('/chat-history', jwtMiddleware, async (c) => {
  const user = c.get('user');
  const env = c.env;

  try {
    // Check if user is admin
    const dbUser = await getUserByUsername(env, user.sub);
    const isAdmin = dbUser?.role === 'admin';
    
    const messages = await getChatMessages(env, user.sub, 50, isAdmin);
    return c.json({ status: 'ok', messages });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Save chat session
chatRouter.post('/save-session', jwtMiddleware, async (c) => {
  const user = c.get('user');
  const env = c.env;
  const data = await c.req.json();

  try {
    const sessionName = data.session_name || 'Chat session';
    const messages = data.messages || [];
    
    const sessionId = await saveChatSession(env, user.sub, sessionName, messages);
    return c.json({ status: 'ok', session_id: sessionId });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get chat sessions
chatRouter.get('/chat-sessions', jwtMiddleware, async (c) => {
  const user = c.get('user');
  const env = c.env;

  try {
    const sessions = await getChatSessions(env, user.sub, 50);
    return c.json({ status: 'ok', sessions });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get specific chat session
chatRouter.get('/chat-session/:id', jwtMiddleware, async (c) => {
  const user = c.get('user');
  const env = c.env;
  const sessionId = parseInt(c.req.param('id'));

  try {
    const session = await getChatSession(env, sessionId, user.sub);
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }
    return c.json({ status: 'ok', session });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete chat session
chatRouter.delete('/chat-session/:id', jwtMiddleware, async (c) => {
  const user = c.get('user');
  const env = c.env;
  const sessionId = parseInt(c.req.param('id'));

  try {
    const success = await deleteChatSession(env, sessionId, user.sub);
    if (!success) {
      return c.json({ error: 'Session not found' }, 404);
    }
    return c.json({ status: 'ok', message: 'Session deleted successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Test database connection
chatRouter.get('/test-db', async (c) => {
  const env = c.env;

  try {
    const result = await testConnection(env);
    return c.json(result);
  } catch (error: any) {
    return c.json({
      error: 'Database connection failed',
      details: error.message,
    }, 500);
  }
});

// Debug endpoint to test SQL generation
chatRouter.post('/debug-sql', jwtMiddleware, async (c) => {
  const body = await c.req.json();
  const user = c.get('user');
  const env = c.env;
  
  try {
    const username = user.sub;
    const prompt = body.prompt || 'Show all users';
    
    // Get user
    const dbUser = await getUserByUsername(env, username);
    if (!dbUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Get schema
    const userSchema = dbUser.role === 'admin' && dbUser.admin_schema
      ? dbUser.admin_schema
      : dbUser.schema;
    
    // Generate SQL
    const sql = await generateSQL(env, prompt, userSchema);
    
    // Validate
    const cleaned = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    const firstToken = cleaned.split(/\s+/)[0]?.toLowerCase();
    
    return c.json({
      prompt,
      schema: userSchema,
      generated_sql: sql,
      cleaned_sql: cleaned,
      first_token: firstToken,
      is_valid_select: firstToken === 'select',
      user_role: dbUser.role,
      has_admin_schema: !!dbUser.admin_schema
    });
  } catch (error: any) {
    return c.json({
      error: error.message,
      stack: error.stack
    }, 500);
  }
});
