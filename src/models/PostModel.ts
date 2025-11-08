import { off } from "process";
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

  async getAll(limit: number, offset: number) {
    const result = await pool.query(
      `SELECT 
        p.id,
        p.author_id,
        u.username AS author_name,
        p.title,
        p.description,
        p.code,
        p.language,
        p.created_at,
        p.updated_at,
        COUNT(DISTINCT c.id) AS comment_count,
        COUNT(DISTINCT pl.user_id) AS like_count
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN comments c ON c.post_id = p.id
      LEFT JOIN post_likes pl ON pl.post_id = p.id
      GROUP BY p.id, u.username
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2;`, [limit, offset]
    );

    return result.rows;
  },

  async count() {
    const result = await pool.query(`SELECT COUNT(*) FROM posts`);
    return parseInt(result.rows[0].count, 10);
  },

  async getById(id: number) {
    const result = await pool.query(
      `SELECT 
        p.id,
        p.author_id,
        u.username AS author_name,
        p.title,
        p.description,
        p.code,
        p.language,
        p.created_at,
        p.updated_at,
        COUNT(DISTINCT c.id) AS comment_count,
        COUNT(DISTINCT pl.user_id) AS like_count
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN comments c ON c.post_id = p.id
      LEFT JOIN post_likes pl ON pl.post_id = p.id
      WHERE p.id = $1
      GROUP BY p.id, u.username;
      `, [id]
    );

    return result.rows[0];
  },

  async getByUserId(userId: number) {
    const result = await pool.query(
      `SELECT 
        p.id,
        p.title,
        p.description,
        p.language,
        p.created_at,
        COUNT(DISTINCT c.id) AS comment_count,
        COUNT(DISTINCT pl.user_id) AS like_count
      FROM posts p
      LEFT JOIN comments c ON c.post_id = p.id
      LEFT JOIN post_likes pl ON pl.post_id = p.id
      WHERE p.author_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC;`, [userId]
    );

    return result.rows;
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

  async search(query: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.code,
        p.language,
        p.created_at,
        u.username AS author_name,
        COUNT(DISTINCT l.user_id) AS like_count,
        COUNT(DISTINCT c.id) AS comment_count
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN post_likes l ON l.post_id = p.id
      LEFT JOIN comments c ON c.post_id = p.id
      WHERE p.title ILIKE $1 OR p.description ILIKE $1
      GROUP BY p.id, u.username
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [`%${query}%`, limit, offset]
    );

    return result.rows;
  }
};
