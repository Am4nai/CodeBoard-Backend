import { Request, Response, NextFunction } from "express";
import { PostModel } from "../models/PostModel";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;

    const offset = (page - 1) * limit;

    const posts = await PostModel.getAll(limit, offset);

    const totalPosts = await PostModel.count();
    const totalPages = Math.ceil(totalPosts / limit);
    const remainingPosts = Math.max(totalPosts - (offset + limit), 0)

    res.json({
      page,
      limit,
      totalPosts,
      totalPages,
      remainingPosts,
      posts,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching posts" });
  }
};

export const getRandomPosts = async (req: Request, res: Response) => {
  try {
    const seed = parseInt(req.query.seed as string) || 0;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;

    const offset = seed + (page - 1) * limit;

    const totalPosts = await PostModel.count();

    if (seed >= totalPosts) return res.status(400).json({ error: "Seed is out of range (must be less than totalPosts)" });
    const totalPages = Math.ceil(totalPosts / limit);

    const posts = await PostModel.getAll(limit, offset);

    const remainingPosts = Math.max(totalPosts - (offset + limit), 0)

    res.json({
      seed, //seed значение
      page, //номер страницы
      limit, //колво постов на странице
      totalPosts, //полное колво постов
      totalPages, //полное колво страниц
      remainingPosts, //оставшееся колво постов
      posts, //массив постов этой страницы
    });
  } catch (err) {
    res.status(500).json({ error: " Error fetching random posts" });
  }
};

export const getCount = async (req: Request, res: Response) => {
  const totalPosts = await PostModel.count();
  res.json({
    totalPosts
  });
};

export const getPostById = async (req: Request, res: Response) => {
  const post = await PostModel.getById(Number(req.params.id));
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
};

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

export const updatePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await PostModel.getById(Number(id));
  if (!post) return res.status(404).json({ error: "Post not found" });

  if (post.author_id !== req.user?.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { title, code, language, description } = req.body;

  const updated = await PostModel.update(
    Number(id),
    title,
    code,
    language,
    description
  );

  res.json(updated);
};

export const deletePost = async(req: Request, res: Response) => {
  const { id } = req.params;
  const post = await PostModel.getById(Number(id));
  if (!post) return res.status(404).json({ error: "Post not found" });

  if (post.author_id !== req.user?.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await PostModel.delete(Number(id));
  res.json({ message: "Post deleted" });
};

export const searchPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = String(req.query.query || "").trim();

    // безопасное приведение типов
    const pageRaw = Number(req.query.page);
    const limitRaw = Number(req.query.limit);

    const page = !isNaN(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit = !isNaN(limitRaw) && limitRaw > 0 ? limitRaw : 15;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const posts = await PostModel.search(query, page, limit);
    res.status(200).json({ posts });
  } catch (err) {
    console.error("Error searching posts:", err);
    next(err);
  }
};

