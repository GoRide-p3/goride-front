import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type { UpdateRideRequestInput } from "./ride-request.schema.js";

const passengerSelect = {
  id: true,
  name: true,
  rating: true,
  totalRatings: true,
  gender: true,
  phone: true,
} as const;

const driverSelect = {
  id: true,
  name: true,
  rating: true,
  totalRatings: true,
  gender: true,
} as const;

const rideRequestInclude = {
  passenger: { select: passengerSelect },
  ride: {
    include: {
      driver: { select: driverSelect },
    },
  },
} as const;

export async function createRideRequest(
  rideId: string,
  passengerId: string,
) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new AppError("Carona nao encontrada", 404);
  if (ride.status !== "active") {
    throw new AppError("Carona nao esta ativa", 400);
  }
  if (ride.availableSeats === 0) {
    throw new AppError("Sem vagas disponiveis", 400);
  }
  if (ride.driverId === passengerId) {
    throw new AppError("Motorista nao pode solicitar a propria carona", 400);
  }

  const existing = await prisma.rideRequest.findUnique({
    where: { rideId_passengerId: { rideId, passengerId } },
  });
  if (existing) throw new AppError("Solicitacao ja enviada", 409);

  return prisma.rideRequest.create({
    data: { rideId, passengerId },
    include: rideRequestInclude,
  });
}

export async function listRideRequests(rideId: string, driverId: string) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    select: { driverId: true },
  });

  if (!ride) {
    throw new AppError("Carona nao encontrada", 404);
  }

  if (ride.driverId !== driverId) {
    throw new AppError("Apenas o motorista pode consultar solicitacoes", 403);
  }

  return prisma.rideRequest.findMany({
    where: { rideId },
    include: { passenger: { select: passengerSelect } },
    orderBy: { createdAt: "asc" },
  });
}

export async function listPassengerRequests(passengerId: string) {
  return prisma.rideRequest.findMany({
    where: { passengerId },
    include: {
      passenger: { select: passengerSelect },
      ride: { include: { driver: { select: driverSelect } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateRideRequest(
  requestId: string,
  driverId: string,
  data: UpdateRideRequestInput,
) {
  return prisma.$transaction(async (transaction) => {
    const request = await transaction.rideRequest.findUnique({
      where: { id: requestId },
      include: { ride: true },
    });

    if (!request) throw new AppError("Solicitacao nao encontrada", 404);
    if (request.ride.driverId !== driverId) {
      throw new AppError("Apenas o motorista pode responder solicitacoes", 403);
    }
    if (request.status !== "pending") {
      throw new AppError("Solicitacao ja foi processada", 400);
    }
    if (data.status === "accepted") {
      const reservedSeat = await transaction.ride.updateMany({
        where: {
          id: request.rideId,
          status: "active",
          availableSeats: { gt: 0 },
        },
        data: { availableSeats: { decrement: 1 } },
      });

      if (reservedSeat.count !== 1) {
        throw new AppError("Carona sem vagas disponiveis", 400);
      }
    }

    return transaction.rideRequest.update({
      where: { id: requestId },
      data: { status: data.status },
      include: rideRequestInclude,
    });
  });
}
