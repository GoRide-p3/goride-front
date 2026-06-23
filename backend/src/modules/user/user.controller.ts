import type { Request, Response } from "express";
import { sendControllerError } from "../../lib/controller-error.js";
import { updateProfileSchema } from "./user.schema.js";
import * as usersService from "./user.service.js";

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

    if (request.userId !== request.params.id) {
      response.status(403).json({ message: "Perfil nao autorizado" });
      return;
    }

    const user = await usersService.updateProfile(request.userId, parsed.data);
    response.json(user);
  } catch (error) {
    sendControllerError(response, error);
  }
}
