import type { Bindings } from '../index';

// PostgreSQL connection using node-postgres compatible API
// For Cloudflare Workers, we'll use Hyperdrive or direct connections

async function getConnection(env: Bindings) {
  // If using Hyperdrive binding
  if (env.HYPERDRIVE) {
    return env.HYPERDRIVE;
  }

  // Direct connection using POSTGRES_URL
  // Note: Direct TCP connections from Workers require Hyperdrive or external proxy
  // For this example, we'll use fetch to a proxy endpoint or Hyperdrive
  return { connectionString: env.POSTGRES_URL };
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

    // For Cloudflare Workers, we need to use Hyperdrive or a proxy
    // This is a simplified example - in production, use Hyperdrive binding
    
    // Using Hyperdrive (recommended approach)
    if (env.HYPERDRIVE) {
      // Hyperdrive provides a postgres-compatible connection
      // You would use a postgres client here
      // For now, this is a placeholder
      throw new Error('Please configure Hyperdrive binding for database access');
    }

    // Alternative: Use a REST API proxy to your database
    // This would require setting up a separate endpoint
    const response = await fetch(`${env.POSTGRES_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Database query failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.rows || [];
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
