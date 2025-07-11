"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // @ts-ignore
        req.userId = decoded.userId;
        // @ts-ignore
        req.role = decoded.role;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
        return;
    }
};
exports.authenticateJWT = authenticateJWT;
const isAdmin = (req, res, next) => {
    // @ts-ignore
    if (req.role !== 'ADMIN') {
        res.status(403).json({ message: 'Forbidden: Admins only.' });
        return;
    }
    next();
};
exports.isAdmin = isAdmin;
