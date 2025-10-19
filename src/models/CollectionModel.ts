import pool from "../config/db";

export class CollectionModel {
  static async create(userId: number, name: string, description?: string) {
    const result = await pool.query(
      `INSERT INTO collections (user_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING *`, [userId, name, description || null]
    );

    return result.rows[0];
  }

  static async getAllByUser(userId: number) {
    const result = await pool.query(
      `SELECT * FROM collections WHERE user_id = $1 ORDER BY created_at DESC`, [userId]
    );

    return result.rows;
  }

  static async getById(id: number) {
    const result = await pool.query(
      `SELECT * FROM collections WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async update(id: number, userId: number, name: string, description?: string) {
    const result = await pool.query(
      `UPDATE collections
       SET name = $1, description = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [name, description || null, id, userId]
    );
    return result.rows[0];
  }

  static async delete(id: number, userId: number) {
    await pool.query(
      `DELETE FROM collections WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  }

  static async addPost(collectionId: number, postId: number) {
    await pool.query(
      `INSERT INTO collection_posts (collection_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [collectionId, postId]
    );
  }

  static async removePost(collectionId: number, postId: number) {
    await pool.query(
      `DELETE FROM collection_posts WHERE collection_id = $1 AND post_id = $2`,
      [collectionId, postId]
    );
  }

  static async getPosts(collectionId: number) {
    const result = await pool.query(
      `SELECT p.*
       FROM posts p
       JOIN collection_posts cp ON p.id = cp.post_id
       WHERE cp.collection_id = $1
       ORDER BY cp.added_at DESC`,
      [collectionId]
    );
    return result.rows;
  }
}