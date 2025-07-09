"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogController_1 = require("../controllers/blogController");
const router = (0, express_1.Router)();
router.get('/blogs', blogController_1.getPublicBlogs);
router.get('/blogs/search', blogController_1.searchPublicBlogs);
router.get('/blogs/search-by-category-tags', blogController_1.searchBlogsByCategoryAndTags);
exports.default = router;
