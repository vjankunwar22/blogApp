import { Router } from "express";
import {
  register,
  login,
  getProfile,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
} from "../controllers/authController";
import { authenticateJWT, isAdmin } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  registerSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema,
} from "../validations/userValidation";
import { upload } from "../middlewares/uploads";

const router = Router();

router.post(
  "/register",
  upload.single("profileImage"),
  validateRequest(registerSchema),
  register
);
router.post("/login", validateRequest(loginSchema), login);
router.get("/profile", authenticateJWT, getProfile);
router.post(
  "/user",
  authenticateJWT,
  isAdmin,
  validateRequest(createUserSchema),
  createUser
);
router.put(
  "/user/:id",
  authenticateJWT,
  upload.single("profileImage"),
  validateRequest(updateUserSchema),
  updateUser
);
router.delete("/user/:id", authenticateJWT, isAdmin, deleteUser);
router.get("/users", authenticateJWT,isAdmin, getAllUsers);

export default router;
