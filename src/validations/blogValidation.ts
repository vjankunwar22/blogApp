import { z } from "zod";

export const createBlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  image: z.string().url().optional().or(z.literal("").optional()),
  publish_datetime: z.string().datetime().optional(),
  published: z.boolean().optional(),
  categoryName: z.string().optional(),
  tagNames: z.array(z.string()).optional(),
});

export const updateBlogSchema = createBlogSchema.partial();

