import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/posts.controller";

const router = Router();

router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/", authMiddleware, createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;