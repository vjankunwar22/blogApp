import { Request, Response } from "express";
import prisma from "../services/db.config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { tryCatchHandler } from "../lib/helpers";
import { HttpError } from "../types/error";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const register = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    // Validation handled by middleware
    const { name, email, password, role } = req.body;
    // Use uploaded file if present
    const profileImage = req.file ? req.file.filename : req.body.profileImage;

    if (!email || !password) {
     throw new HttpError("BAD_REQUEST" , "Email and password is required");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new HttpError("BAD_REQUEST","User Already Exist");
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
    // Validation handled by middleware
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError("BAD_REQUEST" , "Email and password is required");
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      throw new HttpError("UNAUTHORIZED" ,"User not found .");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new HttpError("UNAUTHORIZED" ,"Invalid Credintials");
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
    const userId = req.user.id;
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
     throw new HttpError("NOT_FOUND" ,"User not found.")
    }
    res.status(200).json(user);
    return;
  }
);

export const createUser = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    // Validation handled by middleware
    const { name, email, password, profileImage, role } = req.body;
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
    // Validation handled by middleware
    const { name, email, password, role } = req.body;
    const { id } = req.params;
    // Use uploaded file if present
    const profileImage = req.file ? req.file.filename : req.body.profileImage;
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

export const updateOwnProfile = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user.id;
    const { name, email, password } = req.body;
    // Use uploaded file if present
    const profileImage = req.file ? req.file.filename : req.body.profileImage;
    const data: any = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (profileImage) data.profileImage = profileImage;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    res.status(200).json({ message: "Profile updated successfully.", user });
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
