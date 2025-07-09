"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.searchBlogsByCategoryAndTags = exports.searchPublicBlogs = exports.getPublicBlogs = exports.approveBlog = exports.getMyBlogs = exports.publishBlog = exports.deleteBlog = exports.updateBlog = exports.createBlog = void 0;
const db_config_1 = __importDefault(require("../services/db.config"));
const createBlog = async (req, res) => {
    try {
        const { title, subtitle, description, image, publish_datetime, published, categoryName, tagNames } = req.body;
        // @ts-ignore
        const userId = req.userId;
        let categoryId = undefined;
        if (categoryName && typeof categoryName === 'string') {
            let category = await db_config_1.default.category.findUnique({ where: { name: categoryName } });
            if (!category) {
                category = await db_config_1.default.category.create({ data: { name: categoryName } });
            }
            categoryId = category.id;
        }
        let tagConnectArr = [];
        if (tagNames && Array.isArray(tagNames)) {
            for (const tagName of tagNames) {
                if (typeof tagName !== 'string')
                    continue;
                let tag = await db_config_1.default.tag.findUnique({ where: { name: tagName } });
                if (!tag) {
                    tag = await db_config_1.default.tag.create({ data: { name: tagName } });
                }
                tagConnectArr.push({ tagId: tag.id });
            }
        }
        const post = await db_config_1.default.post.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.createBlog = createBlog;
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subtitle, description, image, publish_datetime, published, categoryName, tagNames } = req.body;
        // @ts-ignore
        const userId = req.userId;
        const post = await db_config_1.default.post.findUnique({ where: { id: Number(id) } });
        if (!post || post.user_id !== userId) {
            res.status(403).json({ message: 'Forbidden: Not your blog.' });
            return;
        }
        let categoryId = undefined;
        if (categoryName && typeof categoryName === 'string') {
            let category = await db_config_1.default.category.findUnique({ where: { name: categoryName } });
            if (!category) {
                category = await db_config_1.default.category.create({ data: { name: categoryName } });
            }
            categoryId = category.id;
        }
        let tagConnectArr = [];
        if (tagNames && Array.isArray(tagNames)) {
            await db_config_1.default.postTag.deleteMany({ where: { postId: Number(id) } });
            for (const tagName of tagNames) {
                if (typeof tagName !== 'string')
                    continue;
                let tag = await db_config_1.default.tag.findUnique({ where: { name: tagName } });
                if (!tag) {
                    tag = await db_config_1.default.tag.create({ data: { name: tagName } });
                }
                tagConnectArr.push({ tagId: tag.id });
            }
        }
        const updated = await db_config_1.default.post.update({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.updateBlog = updateBlog;
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const userId = req.userId;
        const post = await db_config_1.default.post.findUnique({ where: { id: Number(id) } });
        if (!post || post.user_id !== userId) {
            res.status(403).json({ message: 'Forbidden: Not your blog.' });
            return;
        }
        await db_config_1.default.post.delete({ where: { id: Number(id) } });
        res.json({ message: 'Blog deleted.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.deleteBlog = deleteBlog;
const publishBlog = async (req, res) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const userId = req.userId;
        const post = await db_config_1.default.post.findUnique({ where: { id: Number(id) } });
        if (!post || post.user_id !== userId) {
            res.status(403).json({ message: 'Forbidden: Not your blog.' });
            return;
        }
        const updated = await db_config_1.default.post.update({
            where: { id: Number(id) },
            data: { published: true },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.publishBlog = publishBlog;
const getMyBlogs = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const posts = await db_config_1.default.post.findMany({
            where: { user_id: userId },
            include: {
                category: true,
                tags: { include: { tag: true } },
            },
        });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.getMyBlogs = getMyBlogs;
const approveBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await db_config_1.default.post.findUnique({ where: { id: Number(id) } });
        if (!post) {
            res.status(404).json({ message: 'Blog not found.' });
            return;
        }
        const updated = await db_config_1.default.post.update({
            where: { id: Number(id) },
            data: { approved: true },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.approveBlog = approveBlog;
const getPublicBlogs = async (req, res) => {
    try {
        const { categoryId, tagIds } = req.query;
        let tagIdArray = undefined;
        if (tagIds) {
            if (typeof tagIds === 'string') {
                tagIdArray = tagIds.split(',').map(Number);
            }
            else if (Array.isArray(tagIds)) {
                tagIdArray = tagIds.map(Number);
            }
        }
        const posts = await db_config_1.default.post.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.getPublicBlogs = getPublicBlogs;
const searchPublicBlogs = async (req, res) => {
    try {
        const { query, categoryId, tagIds } = req.query;
        let tagIdArray = undefined;
        if (tagIds) {
            if (typeof tagIds === 'string') {
                tagIdArray = tagIds.split(',').map(Number);
            }
            else if (Array.isArray(tagIds)) {
                tagIdArray = tagIds.map(Number);
            }
        }
        if (!query || typeof query !== 'string') {
            res.status(400).json({ message: 'Query parameter is required.' });
            return;
        }
        const posts = await db_config_1.default.post.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.searchPublicBlogs = searchPublicBlogs;
const searchBlogsByCategoryAndTags = async (req, res) => {
    try {
        const { categoryName, tagNames } = req.query;
        let categoryId = undefined;
        if (categoryName && typeof categoryName === 'string') {
            const category = await db_config_1.default.category.findUnique({ where: { name: categoryName } });
            if (!category) {
                res.json([]); // No blogs if category doesn't exist
                return;
            }
            categoryId = category.id;
        }
        let tagIdArray = [];
        if (tagNames) {
            let tagNameArr = [];
            if (typeof tagNames === 'string') {
                tagNameArr = tagNames.split(',').map(s => s.trim()).filter((s) => typeof s === 'string');
            }
            else if (Array.isArray(tagNames)) {
                tagNameArr = tagNames.filter((s) => typeof s === 'string');
            }
            for (const tagName of tagNameArr) {
                let tag = await db_config_1.default.tag.findUnique({ where: { name: tagName } });
                if (tag)
                    tagIdArray.push(tag.id);
            }
        }
        const whereClause = {
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
        const posts = await db_config_1.default.post.findMany({
            where: whereClause,
            include: {
                user: { select: { id: true, name: true, profileImage: true } },
                category: true,
                tags: { include: { tag: true } },
            }
        });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.searchBlogsByCategoryAndTags = searchBlogsByCategoryAndTags;
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string') {
            res.status(400).json({ message: 'Category name is required.' });
            return;
        }
        const existing = await db_config_1.default.category.findUnique({ where: { name } });
        if (existing) {
            res.status(409).json({ message: 'Category already exists.' });
            return;
        }
        const category = await db_config_1.default.category.create({ data: { name } });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.createCategory = createCategory;
