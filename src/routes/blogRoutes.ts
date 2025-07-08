import { Router } from 'express';
import { createBlog, updateBlog, deleteBlog, publishBlog, getMyBlogs, approveBlog } from '../controllers/blogController';
import { authenticateJWT, isAdmin } from '../services/authMiddleware';

const router = Router();

router.get('/my', authenticateJWT, getMyBlogs);
router.post('/', authenticateJWT, createBlog);
router.put('/:id', authenticateJWT, updateBlog);
router.delete('/:id', authenticateJWT, deleteBlog);
router.patch('/:id/publish', authenticateJWT, publishBlog);
router.patch('/:id/approve', authenticateJWT, isAdmin, approveBlog);

export default router;