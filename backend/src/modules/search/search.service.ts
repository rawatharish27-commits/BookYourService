import { db } from "../../config/db";

export const searchService = {
  /**
   * 🏎️ FULL-TEXT SEARCH ENGINE
   */
  async search(query: string, zoneId?: number, limit: number = 20, offset: number = 0) {
    const params: any[] = [query];
    let paramIdx = 2;

    let sql = `
      SELECT 
        si.entity_id as id,
        si.entity_type,
        si.metadata,
        ts_rank(si.searchable_text, plainto_tsquery('english', $1)) as rank
      FROM search_index si
      WHERE si.searchable_text @@ plainto_tsquery('english', $1)
    `;

    if (zoneId) {
      sql += ` AND (si.metadata->>'zone_id')::int = $${paramIdx++}`;
      params.push(zoneId);
    }

    sql += ` ORDER BY rank DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(limit, offset);

    const result = await db.query(sql, params);
    return {
      results: result.rows,
      count: result.rowCount
    };
  },

  async syncServiceIndex(serviceId: string) {
    await db.query(`
      INSERT INTO search_index (entity_type, entity_id, searchable_text, metadata)
      SELECT 
        'SERVICE',
        s.id,
        setweight(to_tsvector('english', s.title), 'A') || 
        setweight(to_tsvector('english', s.description), 'B') ||
        setweight(to_tsvector('english', c.name), 'C'),
        jsonb_build_object('price', s.price, 'zone_id', s.zone_id, 'category', c.name)
      FROM services s
      JOIN categories c ON c.id = s.category_id
      WHERE s.id = $1
      ON CONFLICT (entity_id) DO UPDATE SET
        searchable_text = EXCLUDED.searchable_text,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    `, [serviceId]);
  }
};