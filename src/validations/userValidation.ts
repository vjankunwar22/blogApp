import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  });

export const registerSchema = loginSchema.extend({
  name: z.string().min(1, "Name is required").optional(),
  profileImage: z.string().url().optional().or(z.literal("").optional()),
  role: z.enum(["ADMIN", "BLOGGER"]).optional(),
});



export const createUserSchema = registerSchema;

export const updateUserSchema = registerSchema.partial()
