import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js"
import type { CreateRideInput, ListRidesQuery, UpdateRideInput } from "./ride.schema.js";
import type { Prisma } from "@prisma/client";

type RideWithDriver = Prisma.RideGetPayload<{
  include: { driver: true };
}>;

type RideRequestWithRide = Prisma.RideRequestGetPayload<{
  include: { ride: { include: { driver: true } } };
}>;

function formatRide(ride: RideWithDriver) {
  let driverGender = "Outro";

  if (ride.driver.gender === "Masculino" || ride.driver.gender === "Feminino") {
    driverGender = ride.driver.gender;
  }

  return {
    id: ride.id,
    driverId: ride.driverId,
    driver: {
      id: ride.driver.id,
      name: ride.driver.name,
      rating: ride.driver.rating,
      totalRatings: ride.driver.totalRatings,
      gender: driverGender,
    },
    departure: ride.departureTimeStart,
    origin: ride.origin,
    destination: ride.destination,
    date: ride.date,
    departureTimeStart: ride.departureTimeStart,
    departureTimeEnd: ride.departureTimeEnd,
    price: ride.price,
    totalSeats: ride.totalSeats,
    availableSeats: ride.availableSeats,
    confirmedPassengers: ride.totalSeats - ride.availableSeats,
    routeId: ride.routeId,
    routeName: ride.routeName,
    sameGenderOnly: ride.sameGenderOnly,
    status: ride.status,
    createdAt: ride.createdAt,
    updatedAt: ride.updatedAt,
  };
}

export async function listRides(query: ListRidesQuery) {
  const where: Prisma.RideWhereInput = {};

  if (query.origin) where.origin = { contains: query.origin };
  if (query.destination) where.destination = { contains: query.destination };
  if (query.date) where.date = query.date;
  if (query.timeStart || query.timeEnd) {
    where.departureTimeStart = {
      ...(query.timeStart ? { gte: query.timeStart } : {}),
      ...(query.timeEnd ? { lte: query.timeEnd } : {}),
    };
  }
  if (query.maxPrice !== undefined) where.price = { lte: query.maxPrice };
  if (query.sameGenderOnly !== undefined) {
    where.sameGenderOnly = query.sameGenderOnly;
  }
  if (query.driverId) where.driverId = query.driverId;
  if (query.status) where.status = query.status;

  const rides = await prisma.ride.findMany({
    where,
    include: { driver: true },
    orderBy: [{ date: "asc" }, { departureTimeStart: "asc" }],
  });

  return rides.map(formatRide);
}

export async function getRideById(id: string) {
  const ride = await prisma.ride.findUnique({
    where: { id },
    include: { driver: true },
  });

  if (!ride) {
    throw new AppError("Carona nao encontrada", 404);
  }

  return formatRide(ride);
}

export async function getRideHistory(userId: string) {
  const offered = await prisma.ride.findMany({
    where: {
      driverId: userId,
    },
    include: { driver: true },
    orderBy: [{ date: "desc" }, { departureTimeStart: "desc" }],
  });

  const requested: RideRequestWithRide[] = await prisma.rideRequest.findMany({
    where: {
      passengerId: userId,
    },
    include: {
      ride: { include: { driver: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    offered: offered.map(formatRide),
    requested: requested.map((request) => ({
      id: request.id,
      status: request.status,
      requestedAt: request.createdAt,
      ride: formatRide(request.ride),
    })),
  };
}

export async function createRide(driverId: string, data: CreateRideInput) {
  const availableSeats = data.availableSeats ?? data.totalSeats;

  const ride = await prisma.ride.create({
    data: {
      ...data,
      driverId,
      availableSeats,
    },
    include: { driver: true },
  });

  return formatRide(ride);
}

export async function updateRide(
  id: string,
  driverId: string,
  data: UpdateRideInput,
) {
  const currentRide = await prisma.ride.findUnique({
    where: { id },
    select: { driverId: true, totalSeats: true, availableSeats: true },
  });

  if (!currentRide) {
    throw new AppError("Carona nao encontrada", 404);
  }

  if (currentRide.driverId !== driverId) {
    throw new AppError("Apenas o motorista pode editar a carona", 403);
  }

  const nextTotalSeats = data.totalSeats ?? currentRide.totalSeats;
  const nextAvailableSeats = data.availableSeats ?? currentRide.availableSeats;

  if (nextAvailableSeats > nextTotalSeats) {
    throw new AppError(
      "As vagas disponiveis nao podem superar o total de vagas",
      400,
    );
  }

  const ride = await prisma.ride.update({
    where: { id },
    data,
    include: { driver: true },
  });

  return formatRide(ride);
}

export async function deleteRide(id: string, driverId: string) {
  const ride = await prisma.ride.findUnique({
    where: { id },
    select: { driverId: true },
  });

  if (!ride) {
    throw new AppError("Carona nao encontrada", 404);
  }

  if (ride.driverId !== driverId) {
    throw new AppError("Apenas o motorista pode excluir a carona", 403);
  }

  await prisma.ride.delete({ where: { id } });
}
