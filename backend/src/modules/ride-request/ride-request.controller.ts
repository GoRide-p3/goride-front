import type { Request, Response } from "express";
import { AppError } from "../../lib/app-error.js";
import { createRideRequestSchema, updateRideRequestSchema, } from "./ride-request.schema.js";
import * as rideRequestsService from "./ride-request.service.js";

function sendControllerError(response: Response, error: unknown) {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }
  console.error(error);
  response.status(500).json({ message: "Erro interno do servidor" });
}

export async function createRideRequest(request: Request, response: Response) {
  try {
    const parsed = createRideRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ message: "Dados inválidos", issues: parsed.error.issues });
      return;
    }
    const result = await rideRequestsService.createRideRequest(
      request.params.rideId,
      parsed.data,
    );
    response.status(201).json(result);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function listRideRequests(request: Request, response: Response) {
  try {
    const requests = await rideRequestsService.listRideRequests(
      request.params.rideId,
    );
    response.json(requests);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function listPassengerRequests(request: Request, response: Response) {
  try {
    const requests = await rideRequestsService.listPassengerRequests(
      request.params.passengerId,
    );
    response.json(requests);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function updateRideRequest(request: Request, response: Response) {
  try {
    const parsed = updateRideRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ message: "Dados inválidos", issues: parsed.error.issues });
      return;
    }

    const { status, driverId } = parsed.data;

    const result = await rideRequestsService.updateRideRequest(
      request.params.requestId,
      driverId,
      { status },
    );
    response.json(result);
  } catch (error) {
    sendControllerError(response, error);
  }
}