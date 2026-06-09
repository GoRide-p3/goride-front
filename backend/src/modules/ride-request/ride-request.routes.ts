import { Router } from "express";
import {
  createRideRequest,
  listRideRequests,
  updateRideRequest,
  listPassengerRequests,
} from "./ride-request.controller.js";

export const rideRequestsRouter = Router();

// solicitações de uma carona específica
rideRequestsRouter.post("/rides/:rideId/requests", createRideRequest);
rideRequestsRouter.get("/rides/:rideId/requests", listRideRequests);

// aceitar ou recusar uma solicitação
rideRequestsRouter.patch("/requests/:requestId", updateRideRequest);

// solicitações de um passageiro
rideRequestsRouter.get("/passengers/:passengerId/requests", listPassengerRequests);