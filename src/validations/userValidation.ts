import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profileImage: z.string().url().optional().or(z.literal("").optional()),
  role: z.enum(["ADMIN", "BLOGGER"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createUserSchema = registerSchema;

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  profileImage: z.string().url().optional().or(z.literal("").optional()),
  role: z.enum(["ADMIN", "BLOGGER"]).optional(),
});
