import pool from "../config/db";

export class PostLikeModel {
  static async toggle(postId: number, userId: number) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const existing = await client.query(
        `SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]
      );

      if (existing?.rowCount && existing.rowCount > 0) {
        await client.query(
          `DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]
        );

        await client.query("COMMIT");
        return { liked: false };

      } else {
        await client.query(
          `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)`, [postId, userId]
        );

        await client.query("COMMIT");
        return { liked: true };

      }
    } catch(err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async count(postId: number) {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count FROM post_likes WHERE post_id = $1`,
      [postId]
    );
    return result.rows[0].count;
  }

  static async isLiked(postId: number, userId: number) {
    const result = await pool.query(
      `SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]
    );
    
    return !!result?.rowCount && result.rowCount > 0;
  }
}