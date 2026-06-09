import type { Request, Response } from "express";
import { AppError } from "../../lib/app-error.js";
import { createRideSchema, listRidesQuerySchema, updateRideSchema } from "./ride.schema.js";
import * as ridesService from "../rides/rides.service.js"

function sendValidationError(response: Response, error: unknown) {
  const zodError = error as any;

  return response.status(400).json({
    message: "Dados invalidos",
    issues: zodError.issues ?? [{ message: "Revise os campos enviados" }],
  });
}

function sendControllerError(response: Response, error: unknown) {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  console.error(error);
  response.status(500).json({ message: "Erro interno do servidor" });
}

export async function listRides(request: Request, response: Response) {
  try {
    const parsedQuery = listRidesQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      sendValidationError(response, parsedQuery.error);
      return;
    }

    const rides = await ridesService.listRides(parsedQuery.data);
    response.json(rides);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function getRideById(request: Request, response: Response) {
  try {
    const ride = await ridesService.getRideById(request.params.id);
    response.json(ride);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function getRideHistory(request: Request, response: Response) {
  try {
    const history = await ridesService.getRideHistory(request.params.userId);
    response.json(history);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function createRide(request: Request, response: Response) {
  try {
    const parsedBody = createRideSchema.safeParse(request.body);

    if (!parsedBody.success) {
      sendValidationError(response, parsedBody.error);
      return;
    }

    const ride = await ridesService.createRide(parsedBody.data);
    response.status(201).json(ride);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function updateRide(request: Request, response: Response) {
  try {
    const parsedBody = updateRideSchema.safeParse(request.body);

    if (!parsedBody.success) {
      sendValidationError(response, parsedBody.error);
      return;
    }

    const ride = await ridesService.updateRide(
      request.params.id,
      parsedBody.data,
    );
    response.json(ride);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function deleteRide(request: Request, response: Response) {
  try {
    await ridesService.deleteRide(request.params.id);
    response.status(204).send();
  } catch (error) {
    sendControllerError(response, error);
  }
}
