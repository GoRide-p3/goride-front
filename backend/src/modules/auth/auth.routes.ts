import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";
import {
  changePassword,
  forgotPassword,
  login,
  register,
  resetPassword,
} from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.patch("/change-password", authMiddleware, changePassword);
