
import { PoolClient, QueryResult } from "pg";
import { db } from "../config/db";

export class BaseRepository {
  protected async query(text: string, params?: any[]): Promise<QueryResult> {
    return db.query(text, params);
  }

  protected async getClient(): Promise<PoolClient> {
    return db.connect();
  }
}
