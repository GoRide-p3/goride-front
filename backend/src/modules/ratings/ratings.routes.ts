import { Router } from "express";
import {
  createRating,
  listRideRatings,
  listUserRatings,
} from "./ratings.controller.js";

export const ratingsRouter = Router();

ratingsRouter.post("/", createRating);
ratingsRouter.get("/users/:userId", listUserRatings);
ratingsRouter.get("/rides/:rideId", listRideRatings);
