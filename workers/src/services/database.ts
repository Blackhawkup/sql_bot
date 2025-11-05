import type { Bindings } from '../index';
import postgres from 'postgres';

// Cache connections per request
let sqlCache: any = null;

function getSQL(env: Bindings) {
  if (sqlCache) return sqlCache;
  
  if (!env.HYPERDRIVE) {
    throw new Error('Hyperdrive binding not configured');
  }

  // Create postgres client using Hyperdrive connection string
  sqlCache = postgres(env.HYPERDRIVE.connectionString, {
    prepare: false, // Disable prepared statements for Hyperdrive
  });
  
  return sqlCache;
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
