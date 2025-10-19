import { Router } from "express";
import { getUser, updateUser } from "../controllers/users.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:id", getUser);
router.put("/:id", authMiddleware, updateUser);

export default router;