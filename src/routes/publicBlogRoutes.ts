import { Router } from 'express';
import { getPublicBlogs, searchPublicBlogs, searchBlogsByCategoryAndTags, createCategory } from '../controllers/blogController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/blogs', getPublicBlogs);
router.get('/blogs/search', searchPublicBlogs);
router.get('/blogs/search-by-category-tags', searchBlogsByCategoryAndTags);


export default router; 