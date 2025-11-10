import type { Bindings } from '../index';
import bcrypt from 'bcryptjs';
import { runQuery } from '../services/database';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: string;
  schema: string | null;
  admin_schema: string | null;
  created_at: string;
}

export async function getUserByUsername(
  env: Bindings,
  username: string
): Promise<User | null> {
  try {
    const sql = `SELECT * FROM users WHERE username = '${username}' LIMIT 1;`;
    const rows = await runQuery(env, sql);
    return rows[0] || null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

export async function getUserById(
  env: Bindings,
  userId: number
): Promise<User | null> {
  try {
    const sql = `SELECT * FROM users WHERE id = ${userId} LIMIT 1;`;
    const rows = await runQuery(env, sql);
    return rows[0] || null;
  } catch (error) {
    console.error('Get user by ID error:', error);
    return null;
  }
}

export async function getAllUsers(env: Bindings): Promise<User[]> {
  try {
    const sql = `SELECT id, username, role, schema, admin_schema, created_at FROM users ORDER BY created_at DESC;`;
    return await runQuery(env, sql);
  } catch (error) {
    console.error('Get all users error:', error);
    return [];
  }
}

export async function createUser(
  env: Bindings,
  username: string,
  password: string,
  role: string,
  schema?: string,
  adminSchema?: string
): Promise<User> {
  try {
    // Use HMAC-SHA256 to match Python backend
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(username),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(password)
    );
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signature));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    const sql = `
      INSERT INTO users (username, password_hash, role, schema, admin_schema)
      VALUES ('${username}', '${passwordHash}', '${role}', ${schema ? `'${schema.replace(/'/g, "''")}'` : 'NULL'}, ${adminSchema ? `'${adminSchema.replace(/'/g, "''")}'` : 'NULL'})
      RETURNING *;
    `;
    const rows = await runQuery(env, sql);
    return rows[0];
  } catch (error: any) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

export async function deleteUser(env: Bindings, username: string): Promise<boolean> {
  try {
    const sql = `DELETE FROM users WHERE username = '${username}';`;
    await runQuery(env, sql);
    return true;
  } catch (error) {
    console.error('Delete user error:', error);
    return false;
  }
}

export async function updateUserInfo(
  env: Bindings,
  userId: number,
  data: Partial<{
    username: string;
    password: string;
    role: string;
    schema: string;
    admin_schema: string;
  }>
): Promise<User> {
  try {
    const updates: string[] = [];
    
    if (data.username) updates.push(`username = '${data.username}'`);
    if (data.password) {
      // Use HMAC-SHA256 to match Python backend
      const encoder = new TextEncoder();
      const user = await getUserById(env, userId);
      if (!user) throw new Error('User not found');
      
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(user.username),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(data.password)
      );
      
      const hashArray = Array.from(new Uint8Array(signature));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      updates.push(`password_hash = '${hash}'`);
    }
    if (data.role) updates.push(`role = '${data.role}'`);
    if (data.schema !== undefined) updates.push(`schema = ${data.schema ? `'${data.schema.replace(/'/g, "''")}'` : 'NULL'}`);
    if (data.admin_schema !== undefined) updates.push(`admin_schema = ${data.admin_schema ? `'${data.admin_schema.replace(/'/g, "''")}'` : 'NULL'}`);

    const sql = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = ${userId}
      RETURNING *;
    `;
    
    const rows = await runQuery(env, sql);
    return rows[0];
  } catch (error: any) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

export async function verifyPassword(
  username: string,
  password: string,
  hash: string
): Promise<boolean> {
  try {
    // Use HMAC-SHA256 to match Python backend implementation
    // Python: hmac.new(username.encode(), password.encode(), hashlib.sha256).hexdigest()
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(username),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(password)
    );
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Compare with stored hash
    return hashHex === hash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// Chat and logging functions
export async function logChatMessage(
  env: Bindings,
  username: string,
  role: string,
  content: string,
  sql?: string
): Promise<void> {
  try {
    const sqlQuery = `
      INSERT INTO chat_messages (username, role, content, sql_query)
      VALUES ('${username}', '${role}', '${content.replace(/'/g, "''")}', ${sql ? `'${sql.replace(/'/g, "''")}'` : 'NULL'});
    `;
    await runQuery(env, sqlQuery);
  } catch (error) {
    console.error('Log chat message error:', error);
  }
}

export async function logQuery(
  env: Bindings,
  username: string,
  sql: string,
  status: string,
  rowsAffected: number = 0,
  errorMessage?: string
): Promise<void> {
  try {
    const sqlQuery = `
      INSERT INTO query_logs (username, query, status, rows_affected, error_message)
      VALUES ('${username}', '${sql.replace(/'/g, "''")}', '${status}', ${rowsAffected}, ${errorMessage ? `'${errorMessage.replace(/'/g, "''")}'` : 'NULL'});
    `;
    await runQuery(env, sqlQuery);
  } catch (error) {
    console.error('Log query error:', error);
  }
}

export async function getChatMessages(
  env: Bindings,
  username: string,
  limit: number = 50,
  isAdmin: boolean = false
): Promise<any[]> {
  try {
    // Admin users can see all messages, regular users see only their own
    const sql = isAdmin
      ? `
        SELECT * FROM chat_messages
        ORDER BY created_at DESC
        LIMIT ${limit};
      `
      : `
        SELECT * FROM chat_messages
        WHERE username = '${username}'
        ORDER BY created_at DESC
        LIMIT ${limit};
      `;
    return await runQuery(env, sql);
  } catch (error) {
    console.error('Get chat messages error:', error);
    return [];
  }
}

export async function saveChatSession(
  env: Bindings,
  username: string,
  sessionName: string,
  messages: any[]
): Promise<number> {
  try {
    const sql = `
      INSERT INTO chat_sessions (username, session_name, messages)
      VALUES ('${username}', '${sessionName.replace(/'/g, "''")}', '${JSON.stringify(messages).replace(/'/g, "''")}')
      RETURNING id;
    `;
    const rows = await runQuery(env, sql);
    return rows[0].id;
  } catch (error: any) {
    throw new Error(`Failed to save session: ${error.message}`);
  }
}

export async function getChatSessions(
  env: Bindings,
  username: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const sql = `
      SELECT * FROM chat_sessions
      WHERE username = '${username}'
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;
    const rows = await runQuery(env, sql);
    // Parse messages JSON for each session
    return rows.map(session => {
      try {
        session.messages = JSON.parse(session.messages);
      } catch (e) {
        console.error('Failed to parse messages JSON:', e);
        session.messages = [];
      }
      return session;
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    return [];
  }
}

export async function getChatSession(
  env: Bindings,
  sessionId: number,
  username: string
): Promise<any | null> {
  try {
    const sql = `
      SELECT * FROM chat_sessions
      WHERE id = ${sessionId} AND username = '${username}'
      LIMIT 1;
    `;
    const rows = await runQuery(env, sql);
    if (rows[0]) {
      // Parse the messages JSON string back to array
      try {
        rows[0].messages = JSON.parse(rows[0].messages);
      } catch (e) {
        console.error('Failed to parse messages JSON:', e);
        rows[0].messages = [];
      }
    }
    return rows[0] || null;
  } catch (error) {
    console.error('Get chat session error:', error);
    return null;
  }
}

export async function deleteChatSession(
  env: Bindings,
  sessionId: number,
  username: string
): Promise<boolean> {
  try {
    const sql = `
      DELETE FROM chat_sessions
      WHERE id = ${sessionId} AND username = '${username}';
    `;
    await runQuery(env, sql);
    return true;
  } catch (error) {
    console.error('Delete chat session error:', error);
    return false;
  }
}
