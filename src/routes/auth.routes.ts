import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { verifyToken } from "../controllers/auth.controller";

const router = Router();

router.get("/verify", authMiddleware, verifyToken);
router.post("/register", register);
router.post("/login", login);

export default router;