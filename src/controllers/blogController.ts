import { Request, Response } from 'express';
import prisma from '../services/db.config';
import { tryCatchHandler } from '../lib/helpers';

export const createBlog = tryCatchHandler(async (req: Request, res: Response) => {
    const { title, subtitle, description, image, publish_datetime, published, categoryName, tagNames } = req.body;
    // @ts-ignore
    const userId = req.userId;
    let categoryId: number | undefined = undefined;
    if (categoryName && typeof categoryName === 'string') {
      let category = await prisma.category.findUnique({ where: { name: categoryName } });
      if (!category) {
        category = await prisma.category.create({ data: { name: categoryName } });
      }
      categoryId = category.id;
    }
    let tagConnectArr: { tagId: number }[] = [];
    if (tagNames && Array.isArray(tagNames)) {
      for (const tagName of tagNames) {
        if (typeof tagName !== 'string') continue;
        let tag = await prisma.tag.findUnique({ where: { name: tagName } });
        if (!tag) {
          tag = await prisma.tag.create({ data: { name: tagName } });
        }
        tagConnectArr.push({ tagId: tag.id });
      }
    }
    const post = await prisma.post.create({
      data: {
        title,
        subtitle,
        description,
        image,
        user_id: userId,
        publish_datetime: publish_datetime ? new Date(publish_datetime) : undefined,
        published: published === true ? true : false,
        categoryId,
        tags: tagConnectArr.length > 0 ? { create: tagConnectArr } : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
    res.status(201).json(post);
});

export const updateBlog = tryCatchHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, subtitle, description, image, publish_datetime, published, categoryName, tagNames } = req.body;
    // @ts-ignore
    const userId = req.userId;
    const post = await prisma.post.findUnique({ where: { id: Number(id) } });
    if (!post || post.user_id !== userId) {
      res.status(403).json({ message: 'Forbidden: Not your blog.' });
      return;
    }
    let categoryId: number | undefined = undefined;
    if (categoryName && typeof categoryName === 'string') {
      let category = await prisma.category.findUnique({ where: { name: categoryName } });
      if (!category) {
        category = await prisma.category.create({ data: { name: categoryName } });
      }
      categoryId = category.id;
    }
    let tagConnectArr: { tagId: number }[] = [];
    if (tagNames && Array.isArray(tagNames)) {
      await prisma.postTag.deleteMany({ where: { postId: Number(id) } });
      for (const tagName of tagNames) {
        if (typeof tagName !== 'string') continue;
        let tag = await prisma.tag.findUnique({ where: { name: tagName } });
        if (!tag) {
          tag = await prisma.tag.create({ data: { name: tagName } });
        }
        tagConnectArr.push({ tagId: tag.id });
      }
    }
    const updated = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        title,
        subtitle,
        description,
        image,
        publish_datetime: publish_datetime ? new Date(publish_datetime) : undefined,
        published: published === true ? true : false,
        categoryId,
        tags: tagConnectArr.length > 0 ? { create: tagConnectArr } : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
    res.json(updated);
});

export const deleteBlog = tryCatchHandler(async (req: Request, res: Response) => {
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
});

export const publishBlog = tryCatchHandler(async (req: Request, res: Response) => {
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
});

export const getMyBlogs = tryCatchHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId;
    const posts = await prisma.post.findMany({
      where: { user_id: userId },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
    res.json(posts);
});

export const approveBlog = tryCatchHandler(async (req: Request, res: Response) => {
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
});

export const getPublicBlogs = tryCatchHandler(async (req: Request, res: Response) => {
    const { categoryId, tagIds } = req.query;
    let tagIdArray: number[] | undefined = undefined;
    if (tagIds) {
      if (typeof tagIds === 'string') {
        tagIdArray = tagIds.split(',').map(Number);
      } else if (Array.isArray(tagIds)) {
        tagIdArray = tagIds.map(Number);
      }
    }
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        approved: true,
        categoryId: categoryId ? Number(categoryId) : undefined,
        tags: tagIdArray && tagIdArray.length > 0 ? {
          some: {
            tagId: { in: tagIdArray }
          }
        } : undefined,
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        category: true,
        tags: { include: { tag: true } },
      }
    });
    res.json(posts);
});

export const searchPublicBlogs = tryCatchHandler(async (req: Request, res: Response) => {
    const { query, categoryId, tagIds } = req.query;
    let tagIdArray: number[] | undefined = undefined;
    if (tagIds) {
      if (typeof tagIds === 'string') {
        tagIdArray = tagIds.split(',').map(Number);
      } else if (Array.isArray(tagIds)) {
        tagIdArray = tagIds.map(Number);
      }
    }
    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: 'Query parameter is required.' });
      return;
    }
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        approved: true,
        categoryId: categoryId ? Number(categoryId) : undefined,
        tags: tagIdArray && tagIdArray.length > 0 ? {
          some: {
            tagId: { in: tagIdArray }
          }
        } : undefined,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { subtitle: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        category: true,
        tags: { include: { tag: true } },
      }
    });
    res.json(posts);
});

export const searchBlogsByCategoryAndTags = tryCatchHandler(async (req: Request, res: Response) => {
    const { categoryName, tagNames } = req.query;
    let categoryId: number | undefined = undefined;
    if (categoryName && typeof categoryName === 'string') {
      const category = await prisma.category.findUnique({ where: { name: categoryName } });
      if (!category) {
        res.json([]); // No blogs if category doesn't exist
        return;
      }
      categoryId = category.id;
    }
    let tagIdArray: number[] = [];
    if (tagNames) {
      let tagNameArr: string[] = [];
      if (typeof tagNames === 'string') {
        tagNameArr = tagNames.split(',').map(s => s.trim()).filter((s): s is string => typeof s === 'string');
      } else if (Array.isArray(tagNames)) {
        tagNameArr = tagNames.filter((s): s is string => typeof s === 'string');
      }
      for (const tagName of tagNameArr) {
        let tag = await prisma.tag.findUnique({ where: { name: tagName } });
        if (tag) tagIdArray.push(tag.id);
      }
    }
    const whereClause: any = {
      published: true,
      approved: true,
    };
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    if (tagIdArray.length > 0) {
      whereClause.tags = {
        some: {
          tagId: { in: tagIdArray }
        }
      };
    }
    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        category: true,
        tags: { include: { tag: true } },
      }
    });
    res.json(posts);
});

export const createCategory = tryCatchHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ message: 'Category name is required.' });
      return;
    }
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      res.status(409).json({ message: 'Category already exists.' });
      return;
    }
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
}); 