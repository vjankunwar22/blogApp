import { Router } from 'express';
import { getPublicBlogs, searchPublicBlogs } from '../controllers/blogController';

const router = Router();

router.get('/blogs', getPublicBlogs);
router.get('/blogs/search', searchPublicBlogs);

export default router; 