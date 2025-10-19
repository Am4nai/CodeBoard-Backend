import { Request, Response, NextFunction } from "express";
import pool from "../config/db";

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid user id" });

    const result = await pool.query(
      `SELECT id, username, email, avatar_url, bio, role, created_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "User not found" });

    return res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid user id" });

    const authUser = req.user;
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });

    if (authUser.id !== id && authUser.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { username, avatar_url, bio } = req.body;

    if (username) {
      const exists = await pool.query("SELECT id FROM users WHERE username = $1 AND id <> $2", [username, id]);
      if (exists?.rowCount && exists.rowCount > 0) return res.status(409).json({ error: "username already in use" });
    }

    const result = await pool.query(
      `UPDATE users
       SET username = COALESCE($1, username),
           avatar_url = COALESCE($2, avatar_url),
           bio = COALESCE($3, bio)
       WHERE id = $4
       RETURNING id, username, email, avatar_url, bio, role, created_at`,
      [username || null, avatar_url || null, bio || null, id]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
