import pool from "../config/db";

export const PostModel = {
  async create(authorId: number, title: string, code: string, language: string, description?: string) {
    const result = await pool.query(
      `INSERT INTO posts (author_id, title, code, language, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, author_id, title, description, code, language, created_at, updated_at`,
      [authorId, title, code, language, description || null]
    );

    return result.rows[0];
  },

  async getAll() {
    const result = await pool.query(
      `SELECT p.*, u.username AS author_name
       FROM posts p
       JOIN users u ON p.author_id = u.id
       ORDER BY p.created_at DESC`
    );

    return result.rows;
  },

  async getById(id: number) {
    const result = await pool.query(
      `SELECT p.*, u.username AS author_name
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    return result.rows[0];
  },

  async update(id: number, title?: string, code?: string, language?: string, description?: string) {
    const result = await pool.query(
      `UPDATE posts
       SET title = COALESCE($1, title),
           code = COALESCE($2, code),
           language = COALESCE($3, language),
           description = COALESCE($4, description),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, author_id, title, description, code, language, created_at, updated_at`,
      [title || null, code || null, language || null, description || null, id]
    );
    
    return result.rows[0];
  },

  async delete(id: number) {
    await pool.query("DELETE FROM posts WHERE id = $1", [id]);
  },
};
