"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPublicBlogs = exports.getPublicBlogs = exports.approveBlog = exports.getMyBlogs = exports.publishBlog = exports.deleteBlog = exports.updateBlog = exports.createBlog = void 0;
const db_config_1 = __importDefault(require("../services/db.config"));
const createBlog = async (req, res) => {
    try {
        const { title, subtitle, description, image } = req.body;
        // @ts-ignore
        const userId = req.userId;
        const post = await db_config_1.default.post.create({
            data: { title, subtitle, description, image, user_id: userId },
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
        const { title, subtitle, description, image } = req.body;
        // @ts-ignore
        const userId = req.userId;
        const post = await db_config_1.default.post.findUnique({ where: { id: Number(id) } });
        if (!post || post.user_id !== userId) {
            res.status(403).json({ message: 'Forbidden: Not your blog.' });
            return;
        }
        const updated = await db_config_1.default.post.update({
            where: { id: Number(id) },
            data: { title, subtitle, description, image },
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
        const posts = await db_config_1.default.post.findMany({ where: { user_id: userId } });
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
        const posts = await db_config_1.default.post.findMany({
            where: { published: true, approved: true },
            include: { user: { select: { id: true, name: true, profileImage: true } } }
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
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            res.status(400).json({ message: 'Query parameter is required.' });
            return;
        }
        const posts = await db_config_1.default.post.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.searchPublicBlogs = searchPublicBlogs;
