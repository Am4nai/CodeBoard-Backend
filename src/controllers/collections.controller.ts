import { Request, Response } from "express";
import { CollectionModel } from "../models/CollectionModel";

export const createCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, description } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized user" });
    if (!name) return res.status(400).json({ error: "Name is required" });

    const collection = await CollectionModel.create(userId, name, description);
    res.status(201).json(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating collection" });
  }
};

export const getCollections = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized user" });

    const collections = await CollectionModel.getAllByUser(userId);
    res.json(collections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting collections" });
  }
};

export const getCollectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collection = await CollectionModel.getById(Number(id));
    if (!collection) return res.status(404).json({ error: "Collection not found" });

    const posts = await CollectionModel.getPosts(Number(id));
    res.json({ ...collection, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting collection" });
  }
};

export const updateCollection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { name, description } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized user" });
    if (!name) return res.status(400).json({ error: "Name is required" });

    const updated = await CollectionModel.update(Number(id), userId, name, description);
    if (!updated) return res.status(404).json({ error: "Collection not found or not yours" });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating collection" });
  }
};

export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized user" });

    await CollectionModel.delete(Number(id), userId);
    res.json({ message: "Collection deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting collection" });
  }
};

export const addPostToCollection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { postId } = req.body;

    if (!postId) return res.status(400).json({ error: "postId is required" });

    await CollectionModel.addPost(Number(id), Number(postId));
    res.status(201).json({ message: "Post added to collection" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding post to collection" });
  }
};

export const removePostFromCollection = async (req: Request, res: Response) => {
  try {
    const { id, postId } = req.params;

    await CollectionModel.removePost(Number(id), Number(postId));
    res.json({ message: "Post removed from collection" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error removing post from collection" });
  }
};
