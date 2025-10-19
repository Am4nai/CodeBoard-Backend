import { Request, Response } from "express";
import { PostLikeModel } from "../models/PostLikeModel";

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized user" });

    const result = await PostLikeModel.toggle(Number(postId), userId);
    res.json(result);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Error toggling like" });
  }
};

export const getLikesCount = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const count = await PostLikeModel.count(Number(postId));
    res.json({ count });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Error getting like count" });
  }
};

export const checkIfLiked = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized user" });

    const liked = await PostLikeModel.isLiked(Number(postId), userId);
    res.json({ liked });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Error checking like status" });
  }
}