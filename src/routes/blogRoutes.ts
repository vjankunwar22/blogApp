import { Router } from "express";
import {
  createBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  getMyBlogs,
  approveBlog,
  createCategory,
  likeBlog,
  commentBlog,
  generateBlogWithAI,
} from "../controllers/blogController";
import { authenticateJWT, isAdmin } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createBlogSchema,
  updateBlogSchema,
} from "../validations/blogValidation";
import { upload } from "../middlewares/uploads";

const router = Router();

router.get("/my", authenticateJWT, getMyBlogs);
router.post(
  "/",
  authenticateJWT,
  upload.single("image"),
  validateRequest(createBlogSchema),
  createBlog
);
router.put(
  "/:id",
  authenticateJWT,
  upload.single("image"),
  validateRequest(updateBlogSchema),
  updateBlog
);

router.delete("/:id", authenticateJWT, deleteBlog);
router.patch("/:id/publish", authenticateJWT, publishBlog);
router.patch("/:id/approve", authenticateJWT, isAdmin, approveBlog);
router.post("/categories", authenticateJWT, createCategory);
router.patch("/:id/like", authenticateJWT, likeBlog);
router.post("/:id/comment", authenticateJWT, commentBlog);

router.post("/generate-ai", authenticateJWT, generateBlogWithAI);
export default router;
