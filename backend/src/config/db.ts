import { Pool } from 'pg';
import { env } from './env.js';

/**
 * PostgreSQL connection pool.
 *
 * The pool is only created when DATABASE_URL is set. The server boots
 * even without a database — in that mode it serves seed data from memory
 * so the frontend demo works without requiring the contributor to set up
 * Postgres locally (FSMOD §16: keep the mock backend honest but minimal).
 */
let _pool: Pool | null = null;

export function getPool(): Pool | null {
  if (!env.databaseUrl) return null;
  if (!_pool) {
    _pool = new Pool({ connectionString: env.databaseUrl });
    _pool.on('error', (err) => {
      console.error('[db] unexpected error on idle client', err);
    });
  }
  return _pool;
}
