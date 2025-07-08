import { Request, Response } from 'express';
import prisma from '../services/db.config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, profileImage, role } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'User already exists.' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profileImage,
        role: role === 'ADMIN' ? 'ADMIN' : 'BLOGGER',
      },
    });
    res.status(201).json({ message: 'User registered successfully.' });
    return;
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token });
    return;
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
    return;
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, profileImage: true, role: true },
    });
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    res.status(200).json(user);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
    return;
  }
};

export const createUser = async (req: Request, res: Response) => {

  try {
    const { name, email, password, profileImage, role } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'User already exists.' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profileImage,
        role: role === 'ADMIN' ? 'ADMIN' : 'BLOGGER',
      },
    });
    res.status(201).json({ message: 'User created successfully.', user });
    return;
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
    return;
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, profileImage, role } = req.body;
    const data: any = { name, email, profileImage, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });
    res.status(200).json({ message: 'User updated successfully.', user });
    return;
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
    return;
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: 'User deleted successfully.' });
    return;
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
    return;
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, profileImage: true, role: true, created_at: true }
    });
    res.status(200).json(users);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
    return;
  }
}; 