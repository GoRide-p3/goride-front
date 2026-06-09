import type { Request, Response } from "express";
import { AppError } from "../../lib/app-error.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.schema.js";
import * as authService from "../auth/auth.service.js"

function sendControllerError(response: Response, error: unknown) {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }
  console.error(error);
  response.status(500).json({ message: "Erro interno do servidor" });
}

export async function register(request: Request, response: Response) {
  try {
    const parsed = registerSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        message: "Dados inválidos",
        issues: parsed.error.issues,
      });
      return;
    }

    const result = await authService.register(parsed.data);
    response.status(201).json(result);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function login(request: Request, response: Response) {
  try {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        message: "Dados inválidos",
        issues: parsed.error.issues,
      });
      return;
    }

    const result = await authService.login(parsed.data);
    response.json(result);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function forgotPassword(request: Request, response: Response) {
  try {
    const parsed = forgotPasswordSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        message: "Dados invalidos",
        issues: parsed.error.issues,
      });
      return;
    }

    const result = await authService.forgotPassword(parsed.data);
    response.json(result);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function resetPassword(request: Request, response: Response) {
  try {
    const parsed = resetPasswordSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        message: "Dados invalidos",
        issues: parsed.error.issues,
      });
      return;
    }

    const result = await authService.resetPassword(parsed.data);
    response.json(result);
  } catch (error) {
    sendControllerError(response, error);
  }
}

export async function changePassword(request: Request, response: Response) {
  try {
    const parsed = changePasswordSchema.safeParse(request.body);

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

    const result = await authService.changePassword(
      request.userId,
      parsed.data,
    );
    response.json(result);
  } catch (error) {
    sendControllerError(response, error);
  }
}
