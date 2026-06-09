import type { Request, Response } from "express";
import { AppError } from "../../lib/app-error.js";
import { updateProfileSchema } from "./user.schema.js";
import * as usersService from "./user.service.js";

function sendControllerError(response: Response, error: unknown) {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }
  console.error(error);
  response.status(500).json({ message: "Erro interno do servidor" });
}

export async function getProfile(request: Request, response: Response) {
  try {
    const user = await usersService.getUserById(request.params.id);
    response.json(user);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function updateProfile(request: Request, response: Response) {
  try {
    const parsed = updateProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ message: "Dados inválidos", issues: parsed.error.issues });
      return;
    }
    const user = await usersService.updateProfile(request.params.id, parsed.data);
    response.json(user);
  } catch (error) {
    sendControllerError(response, error);
  }
}