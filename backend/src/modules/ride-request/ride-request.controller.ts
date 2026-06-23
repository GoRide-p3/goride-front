import type { Request, Response } from "express";
import { sendControllerError } from "../../lib/controller-error.js";
import { updateRideRequestSchema } from "./ride-request.schema.js";
import * as rideRequestsService from "./ride-request.service.js";

function getAuthenticatedUserId(request: Request, response: Response) {
  if (!request.userId) {
    response.status(401).json({ message: "Usuario nao autenticado" });
    return null;
  }

  return request.userId;
}

export async function createRideRequest(request: Request, response: Response) {
  try {
    const passengerId = getAuthenticatedUserId(request, response);
    if (!passengerId) return;

    const result = await rideRequestsService.createRideRequest(
      request.params.rideId,
      passengerId,
    );
    response.status(201).json(result);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function listRideRequests(request: Request, response: Response) {
  try {
    const driverId = getAuthenticatedUserId(request, response);
    if (!driverId) return;

    const requests = await rideRequestsService.listRideRequests(
      request.params.rideId,
      driverId,
    );
    response.json(requests);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function listPassengerRequests(
  request: Request,
  response: Response,
) {
  try {
    const passengerId = getAuthenticatedUserId(request, response);
    if (!passengerId) return;

    const requests =
      await rideRequestsService.listPassengerRequests(passengerId);
    response.json(requests);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function updateRideRequest(request: Request, response: Response) {
  try {
    const parsed = updateRideRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        message: "Dados invalidos",
        issues: parsed.error.issues,
      });
      return;
    }

    const driverId = getAuthenticatedUserId(request, response);
    if (!driverId) return;

    const result = await rideRequestsService.updateRideRequest(
      request.params.requestId,
      driverId,
      parsed.data,
    );
    response.json(result);
  } catch (error) {
    sendControllerError(response, error);
  }
}
