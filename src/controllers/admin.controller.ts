import { Request, Response } from "express";
import pool from "../config/db";

export const getAllUsers = async (req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT id, username, email, avatar_url, bio, role, created_at
    FROM users
    ORDER BY created_at DESC
  `);

  res.json(result.rows);
};

export const getUserByIdAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query(`
    SELECT id, username, email, avatar_url, bio, role, created_at
    FROM users
    WHERE id = $1
  `, [id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(result.rows[0]);
};

export const updateUserByAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, avatar_url, bio, role } = req.body;

  const result = await pool.query(`
    UPDATE users
    SET 
      username = COALESCE($1, username),
      email = COALESCE($2, email),
      avatar_url = COALESCE($3, avatar_url),
      bio = COALESCE($4, bio),
      role = COALESCE($5, role)
    WHERE id = $6
    RETURNING id, username, email, avatar_url, bio, role, created_at
  `, [username, email, avatar_url, bio, role, id]);

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(result.rows[0]);
};

export const deleteUserByAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ message: "User deleted" });
};
