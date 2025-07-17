import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(1, "Name is required").optional(),
  profileImage: z.url().optional().or(z.literal("").optional()),
  role: z.enum(["ADMIN", "BLOGGER"]).optional(),
});

export const createUserSchema = registerSchema;

export const updateUserSchema = registerSchema.partial();

export const deleteUserSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, "Invalid user id")
      .transform(Number)
      .refine((val) => val > 0, {
        message: "User id must be a positive integer",
      }),
  }),
});

export const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  profileImage: z.url().optional().or(z.literal("").optional()),
  email: z.email("Invalid email address").optional(),
  password: z.string().min(1, "Password is required").optional(),
});
