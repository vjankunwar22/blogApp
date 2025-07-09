import { Router } from 'express';
import { createBlog, updateBlog, deleteBlog, publishBlog, getMyBlogs, approveBlog, createCategory } from '../controllers/blogController';
import { authenticateJWT, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/my', authenticateJWT, getMyBlogs);
router.post('/', authenticateJWT, createBlog);
router.put('/:id', authenticateJWT, updateBlog);
router.delete('/:id', authenticateJWT, deleteBlog);
router.patch('/:id/publish', authenticateJWT, publishBlog);
router.patch('/:id/approve', authenticateJWT, isAdmin, approveBlog);
router.post('/categories', authenticateJWT, createCategory);

export default router;