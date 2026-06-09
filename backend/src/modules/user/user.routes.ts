import { Router } from "express";
import { getProfile, updateProfile } from "./user.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";

export const userRouter = Router();

userRouter.get("/:id", getProfile);
userRouter.put("/:id", authMiddleware, updateProfile);