import { Router } from 'express';
import { register, login, getProfile, createUser, updateUser, deleteUser, getAllUsers } from '../controllers/authController';
import { authenticateJWT, isAdmin } from '../middlewares/authMiddleware';



const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateJWT, getProfile);
router.post('/user', authenticateJWT, isAdmin, createUser);
router.put('/user/:id', authenticateJWT, isAdmin, updateUser);
router.delete('/user/:id', authenticateJWT, isAdmin, deleteUser);
router.get('/users', authenticateJWT, isAdmin, getAllUsers);

export default router; 