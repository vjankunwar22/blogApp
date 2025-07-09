import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    // @ts-ignore
    req.userId = decoded.userId;
    // @ts-ignore
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
    return;
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if (req.role !== 'ADMIN') {
    res.status(403).json({ message: 'Forbidden: Admins only.' });
    return;
  }
  next();
}; 