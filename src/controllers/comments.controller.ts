import { Request, Response } from "express";
import { CommentModel } from "../models/CommentModel";
import { getCommentDepth } from "../models/CommentModel";
import { error } from "console";
import { buildTree } from "../utils/tree";
import { CommentNode } from "../types/comment";

export const createComment = async (req: Request, res: Response) => {
  try {
    const { post_id, content, parent_id } = req.body;
    const authorId = req.user?.id;

    if (!authorId)
      return res.status(401).json({ error: "Unauthorized user" });

    const MAX_DEPTH = 3;
    const depth = await getCommentDepth(parent_id || null);
    if (depth > MAX_DEPTH) {
      return res.status(400).json({ error: `Maximum nesting level (${MAX_DEPTH}) reached` });
    }

    const newComment = await CommentModel.create(post_id, authorId, content, parent_id || null);
    res.status(201).json(newComment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating comment" });
  }
};

export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const comments = (await CommentModel.getByPostId(Number(postId))) as CommentNode[];
    const tree = buildTree(comments);
    res.json(tree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error receiving comments" });
  }
};

export const getCommentCount = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const count = (await CommentModel.countByPostId(Number(postId)));
    res.json(count);
  } catch (err) {
    console.error(error);
    res.status(500).json({ error: "Error receiving count comments" });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const authorId = req.user?.id;

    if (!authorId) return res.status(401).json({ error: "Unauthorized user" });
    if (!content) return res.status(400).json({ error: "Content is required" });
    
    const updated = await CommentModel.update(Number(id), authorId, content);

    if (!updated) return res.status(404).json({ error: "Comment not found or access denied" });
    res.json(updated);
  } catch(err) {
    console.error(error);
    res.status(500).json({ error: "Error updating comment" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authorId = req.user?.id;

    if (!authorId) return res.status(401).json({ error: "Unauthorized user" });

    const deleted = await CommentModel.delete(Number(id), authorId);

    if (!deleted) return res.status(404).json({ error: "Comment not found" });
    res.json({ message: "Comment deleted" });
  } catch(err) {
    console.error(error);
    res.status(500).json({ error: "Error deleting comment" });
  }
};