import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import {
  createRating,
  listRideRatings,
  listUserRatings,
} from "./ratings.controller.js";

export const ratingsRouter = Router();

ratingsRouter.post("/", authMiddleware, createRating);
ratingsRouter.get("/users/:userId", listUserRatings);
ratingsRouter.get("/rides/:rideId", listRideRatings);
