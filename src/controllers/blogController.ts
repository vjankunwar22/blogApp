import { Request, Response } from 'express';
import prisma from '../services/db.config';

export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, subtitle, description, image } = req.body;
    // @ts-ignore
    const userId = req.userId;
    const post = await prisma.post.create({
      data: { title, subtitle, description, image, user_id: userId },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, image } = req.body;
    // @ts-ignore
    const userId = req.userId;
    const post = await prisma.post.findUnique({ where: { id: Number(id) } });
    if (!post || post.user_id !== userId) {
      res.status(403).json({ message: 'Forbidden: Not your blog.' });
      return;
    }
    const updated = await prisma.post.update({
      where: { id: Number(id) },
      data: { title, subtitle, description, image },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.userId;
    const post = await prisma.post.findUnique({ where: { id: Number(id) } });
    if (!post || post.user_id !== userId) {
      res.status(403).json({ message: 'Forbidden: Not your blog.' });
      return;
    }
    await prisma.post.delete({ where: { id: Number(id) } });
    res.json({ message: 'Blog deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const publishBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.userId;
    const post = await prisma.post.findUnique({ where: { id: Number(id) } });
    if (!post || post.user_id !== userId) {
      res.status(403).json({ message: 'Forbidden: Not your blog.' });
      return;
    }
    const updated = await prisma.post.update({
      where: { id: Number(id) },
      data: { published: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getMyBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const posts = await prisma.post.findMany({ where: { user_id: userId } });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const approveBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({ where: { id: Number(id) } });
    if (!post) {
      res.status(404).json({ message: 'Blog not found.' });
      return;
    }
    const updated = await prisma.post.update({
      where: { id: Number(id) },
      data: { approved: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getPublicBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true, approved: true },
      include: { user: { select: { id: true, name: true, profileImage: true } } }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const searchPublicBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: 'Query parameter is required.' });
      return;
    }
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        approved: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { subtitle: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { user: { select: { id: true, name: true, profileImage: true } } }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
}; 