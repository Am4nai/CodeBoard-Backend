import { Request, Response, NextFunction } from "express";
import { PostModel } from "../models/PostModel";

export const getPosts = async (_req: Request, res: Response) => {
  const posts = await PostModel.getAll();
  res.json(posts);
};

export const getPostById = async (req: Request, res: Response) => {
  const post = await PostModel.getById(Number(req.params.id));
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
}

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, code, language, description } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!title || !code || !language) {
      return res.status(400).json({ error: "title, code and language are required" });
    }

    const post = await PostModel.create(user.id, title, code, language, description);
    return res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

export const updatePost = async(req: Request, res: Response) => {
  const { id } = req.params;
  const post = await PostModel.getById(Number(id));
  if (!post) return res.status(404).json({ error: "Post not found" });

  if (post.author_id !== req.user?.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updated = await PostModel.update(Number(id), req.body);
  res.json(updated);
}

export const deletePost = async(req: Request, res: Response) => {
  const { id } = req.params;
  const post = await PostModel.getById(Number(id));
  if (!post) return res.status(404).json({ error: "Post not found" });

  if (post.author_id !== req.user?.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await PostModel.delete(Number(id));
  res.json({ message: "Post deleted" });
}