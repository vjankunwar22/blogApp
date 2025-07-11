"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.deleteUser = exports.updateUser = exports.createUser = exports.getProfile = exports.login = exports.register = void 0;
const db_config_1 = __importDefault(require("../services/db.config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helpers_1 = require("../lib/helpers");
const error_1 = require("../types/error");
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
exports.register = (0, helpers_1.tryCatchHandler)(async (req, res) => {
    const { name, email, password, profileImage, role } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
    }
    const existingUser = await db_config_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        res.status(409).json({ message: 'User already exists.' });
        return;
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await db_config_1.default.user.create({
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
});
exports.login = (0, helpers_1.tryCatchHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
    }
    const user = await db_config_1.default.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        res.status(401).json({ message: 'Invalid credentials.' });
        return;
    }
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials.' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token });
    return;
});
exports.getProfile = (0, helpers_1.tryCatchHandler)(async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const user = await db_config_1.default.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, profileImage: true, role: true },
    });
    if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
    }
    res.status(200).json(user);
    return;
});
exports.createUser = (0, helpers_1.tryCatchHandler)(async (req, res) => {
    const { name, email, password, profileImage, role } = req.body;
    if (!email || !password) {
        throw new error_1.HttpError('BAD_REQUEST', 'Email and password are required.');
    }
    const existingUser = await db_config_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new error_1.HttpError('BAD_REQUEST', 'User already exists.');
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await db_config_1.default.user.create({
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
});
exports.updateUser = (0, helpers_1.tryCatchHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, email, password, profileImage, role } = req.body;
    const data = { name, email, profileImage, role };
    if (password) {
        data.password = await bcrypt_1.default.hash(password, 10);
    }
    const user = await db_config_1.default.user.update({
        where: { id: Number(id) },
        data,
    });
    res.status(200).json({ message: 'User updated successfully.', user });
    return;
});
exports.deleteUser = (0, helpers_1.tryCatchHandler)(async (req, res) => {
    const { id } = req.params;
    await db_config_1.default.user.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: 'User deleted successfully.' });
    return;
});
exports.getAllUsers = (0, helpers_1.tryCatchHandler)(async (req, res) => {
    const users = await db_config_1.default.user.findMany({
        select: { id: true, name: true, email: true, profileImage: true, role: true, created_at: true }
    });
    res.status(200).json(users);
    return;
});
