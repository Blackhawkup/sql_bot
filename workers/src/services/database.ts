import type { Bindings } from '../index';
import postgres from 'postgres';

// Don't cache globally in Workers - create new connection per request
function getSQL(env: Bindings) {
  if (!env.HYPERDRIVE) {
    throw new Error('Hyperdrive binding not configured');
  }

  // Create postgres client using Hyperdrive connection string
  const sql = postgres(env.HYPERDRIVE.connectionString, {
    prepare: false, // Disable prepared statements for Hyperdrive
    max: 1, // Single connection for Workers
    idle_timeout: 20,
    connect_timeout: 10,
  });
  
  return sql;
}

export async function runQuery(
  env: Bindings,
  sql: string,
  limit?: number
): Promise<any[]> {
  try {
    // Apply limit if specified
    let query = sql;
    if (limit && !sql.toLowerCase().includes('limit')) {
      query = `${sql.trim().replace(/;$/, '')} LIMIT ${limit};`;
    }

    const db = getSQL(env);
    
    // Execute raw SQL query
    const result = await db.unsafe(query);
    
    return result || [];
  } catch (error: any) {
    console.error('Query execution error:', error);
    throw new Error(`Query failed: ${error.message}`);
  }
}

export async function testConnection(env: Bindings): Promise<any> {
  try {
    const result = await runQuery(env, 'SELECT version() as version;');
    return {
      status: 'ok',
      version: result[0]?.version || 'Unknown',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}
