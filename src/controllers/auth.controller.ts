import { Request, Response, NextFunction } from "express";
import pool from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

//dotenv
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "1d") as StringValue;
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || "12");

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const user = req.user; // уже расшифрованный JWT
    return res.status(200).json({ valid: true, user });
  } catch (err) {
    return res.status(401).json({ valid: false });
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {username, email, password} = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email and password are required" });
    }

    const check = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (check?.rowCount && check.rowCount > 0) {
      return res.status(409).json({ error: "username or email already exists" });
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, avatar_url, bio, role, created_at`,
      [username, email, password_hash]
    )

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emailOrUsername, password } = req.body;
  
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: "emailOrUsername and password are required" });
    }
  
    const result = await pool.query(
      `SELECT id, username, email, password_hash, avatar_url, bio, role, created_at
      FROM users WHERE email = $1 OR username = $1`,
      [emailOrUsername]
    );
  
    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
  
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
  
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
    delete user.password_hash;
    return res.json({ user, token });
  } catch (err) {
    next(err);
  }
};
