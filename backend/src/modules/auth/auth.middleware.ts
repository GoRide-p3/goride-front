import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/auth.js";

export function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    response.status(401).json({ message: "Token nao fornecido" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !payload.sub
    ) {
      response.status(401).json({ message: "Token invalido ou expirado" });
      return;
    }

    request.userId = payload.sub;
    next();
  } catch {
    response.status(401).json({ message: "Token invalido ou expirado" });
  }
}
