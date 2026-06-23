import type { Request, Response } from "express";
import { sendControllerError } from "../../lib/controller-error.js";
import { createRatingSchema } from "./rating.schema.js";
import * as ratingsService from "./ratings.service.js";

export async function createRating(request: Request, response: Response) {
  try {
    const parsed = createRatingSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        message: "Dados invalidos",
        issues: parsed.error.issues,
      });
      return;
    }

    if (!request.userId) {
      response.status(401).json({ message: "Usuario nao autenticado" });
      return;
    }

    const rating = await ratingsService.createRating(
      request.userId,
      parsed.data,
    );
    response.status(201).json(rating);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function listUserRatings(request: Request, response: Response) {
  try {
    const ratings = await ratingsService.listUserRatings(request.params.userId);
    response.json(ratings);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function listRideRatings(request: Request, response: Response) {
  try {
    const ratings = await ratingsService.listRideRatings(request.params.rideId);
    response.json(ratings);
  } catch (error) {
    sendControllerError(response, error);
  }
}
