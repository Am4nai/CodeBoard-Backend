import { error } from "console";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Authorization header missing" });

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ error: "Invalid authorization format" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = { id: Number(payload.userId), role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};