import { Router } from "express";
import { getUser, updateUser, getUserPosts } from "../controllers/users.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { searchUsers } from "../controllers/users.controller";

const router = Router();

router.get("/search", searchUsers);
router.get("/:id/posts", getUserPosts);
router.get("/:id", getUser);
router.put("/:id", authMiddleware, updateUser);

export default router;