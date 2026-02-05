
import { Pool, PoolClient, QueryResult } from "pg";
import { env } from "./env";
import { logger } from "../utils/logger";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Resilient Connect for Docker environments
const connectWithRetry = async (retries = 5, delay = 2000): Promise<PoolClient> => {
    for (let i = 0; i < retries; i++) {
        try {
            const client = await pool.connect();
            return client;
        } catch (err) {
            if (i === retries - 1) throw err;
            logger.warn(`Database connection failed. Retrying in ${delay}ms... (${i + 1}/${retries})`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    throw new Error("Could not connect to database after multiple retries");
};

export const db = {
  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return await pool.query(text, params);
  },

  async connect(): Promise<PoolClient> {
    return await connectWithRetry();
  },

  async transaction<T>(
    fn: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async healthCheck() {
    await pool.query("SELECT 1");
  },

  async close() {
    await pool.end();
  },

  async end() {
    await pool.end();
  }
};

export const withTransaction = db.transaction;
