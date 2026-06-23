import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import {
  createRideRequest,
  listRideRequests,
  updateRideRequest,
  listPassengerRequests,
} from "./ride-request.controller.js";

export const rideRequestsRouter = Router();

// solicitações de uma carona específica
rideRequestsRouter.post(
  "/rides/:rideId/requests",
  authMiddleware,
  createRideRequest,
);
rideRequestsRouter.get(
  "/rides/:rideId/requests",
  authMiddleware,
  listRideRequests,
);

// aceitar ou recusar uma solicitação
rideRequestsRouter.patch(
  "/requests/:requestId",
  authMiddleware,
  updateRideRequest,
);

// solicitações de um passageiro
rideRequestsRouter.get(
  "/passengers/me/requests",
  authMiddleware,
  listPassengerRequests,
);
