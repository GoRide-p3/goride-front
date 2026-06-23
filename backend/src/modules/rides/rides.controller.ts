import type { Request, Response } from "express";
import type { ZodError } from "zod";
import { sendControllerError } from "../../lib/controller-error.js";
import {
  createRideSchema,
  listRidesQuerySchema,
  updateRideSchema,
} from "./ride.schema.js";
import * as ridesService from "./rides.service.js";

function sendValidationError(response: Response, error: ZodError) {
  return response.status(400).json({
    message: "Dados invalidos",
    issues: error.issues,
  });
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
    if (!request.userId) {
      response.status(401).json({ message: "Usuario nao autenticado" });
      return;
    }

    const history = await ridesService.getRideHistory(request.userId);
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

    if (!request.userId) {
      response.status(401).json({ message: "Usuario nao autenticado" });
      return;
    }

    const ride = await ridesService.createRide(request.userId, parsedBody.data);
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

    if (!request.userId) {
      response.status(401).json({ message: "Usuario nao autenticado" });
      return;
    }

    const ride = await ridesService.updateRide(
      request.params.id,
      request.userId,
      parsedBody.data,
    );
    response.json(ride);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function deleteRide(request: Request, response: Response) {
  try {
    if (!request.userId) {
      response.status(401).json({ message: "Usuario nao autenticado" });
      return;
    }

    await ridesService.deleteRide(request.params.id, request.userId);
    response.status(204).send();
  } catch (error) {
    sendControllerError(response, error);
  }
}
