import { Router } from "express";
import { getUser, updateUser, getUserPosts } from "../controllers/users.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:id", getUser);
router.put("/:id", authMiddleware, updateUser);
router.get("/:id/posts", getUserPosts);

export default router;