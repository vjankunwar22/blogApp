import { Request, Response } from "express";
import prisma from "../services/db.config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { tryCatchHandler } from "../lib/helpers";
import { HttpError } from "../types/error";
import {
  registerSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema,
} from "../validations/userValidation";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const register = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
      return;
    }
    const { name, email, password, profileImage, role } = parseResult.data;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: "User already exists." });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profileImage,
        role: role === "ADMIN" ? "ADMIN" : "BLOGGER",
      },
    });
    res.status(201).json({ message: "User registered successfully." });
    return;
  }
);

export const login = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
      return;
    }
    const { email, password } = parseResult.data;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({ token });
    return;
  }
);

export const getProfile = tryCatchHandler(
  async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        role: true,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }
    res.status(200).json(user);
    return;
  }
);

export const createUser = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    const parseResult = createUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new HttpError(
        "BAD_REQUEST",
        "Validation failed: " + JSON.stringify(parseResult.error.issues)
      );
    }
    const { name, email, password, profileImage, role } = parseResult.data;
    if (!email || !password) {
      throw new HttpError("BAD_REQUEST", "Email and password are required.");
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HttpError("BAD_REQUEST", "User already exists.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profileImage,
        role: role === "ADMIN" ? "ADMIN" : "BLOGGER",
      },
    });
    res.status(201).json({ message: "User created successfully.", user });
    return;
  }
);

export const updateUser = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    const parseResult = updateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
      return;
    }
    const { name, email, password, profileImage, role } = parseResult.data;
    const { id } = req.params;
    const data: any = { name, email, profileImage, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });
    res.status(200).json({ message: "User updated successfully.", user });
    return;
  }
);

export const deleteUser = tryCatchHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: "User deleted successfully." });
    return;
  }
);

export const getAllUsers = tryCatchHandler(
  async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        role: true,
        created_at: true,
      },
    });
    res.status(200).json(users);
    return;
  }
);
