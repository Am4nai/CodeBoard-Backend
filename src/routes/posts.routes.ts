import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getPosts,
  getRandomPosts,
  getCount,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
} from "../controllers/posts.controller";

const router = Router();

// 🔹 Сначала конкретные маршруты
router.get("/random", getRandomPosts);
router.get("/count", getCount);
router.get("/search", searchPosts);

// 🔹 Потом базовые маршруты
router.get("/", getPosts);
router.post("/", authMiddleware, createPost);

// 🔹 В самом конце — параметрические (/:id)
router.get("/:id", getPostById);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;
