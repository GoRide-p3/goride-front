import { Prisma } from "@prisma/client";
import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateRatingInput } from "./rating.schema.js";

const ratingUserSelect = {
  id: true,
  name: true,
  rating: true,
  totalRatings: true,
} satisfies Prisma.UserSelect;

const ratingRideSelect = {
  id: true,
  driverId: true,
  origin: true,
  destination: true,
  date: true,
  departureTimeStart: true,
  departureTimeEnd: true,
  status: true,
} satisfies Prisma.RideSelect;

const ratingInclude = {
  fromUser: { select: ratingUserSelect },
  toUser: { select: ratingUserSelect },
  ride: { select: ratingRideSelect },
} satisfies Prisma.RatingInclude;

type RatingUser = Prisma.UserGetPayload<{
  select: typeof ratingUserSelect;
}>;

type RatingWithRelations = Prisma.RatingGetPayload<{
  include: typeof ratingInclude;
}>;

function formatUser(user: RatingUser) {
  return {
    id: user.id,
    name: user.name,
    rating: user.rating,
    totalRatings: user.totalRatings,
  };
}

function formatRating(rating: RatingWithRelations) {
  return {
    id: rating.id,
    rating: rating.rating,
    comment: rating.comment,
    createdAt: rating.createdAt,
    fromUser: formatUser(rating.fromUser),
    toUser: formatUser(rating.toUser),
    ride: rating.ride,
  };
}

function hasRideEnded(date: string, time: string) {
  const timeZone = process.env.APP_TIME_ZONE ?? "America/Sao_Paulo";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const currentDate = `${values.year}-${values.month}-${values.day}`;
  const currentTime = `${values.hour}:${values.minute}`;

  return date < currentDate || (date === currentDate && time <= currentTime);
}

async function validateRatingParticipants(
  fromUserId: string,
  data: CreateRatingInput,
) {
  if (fromUserId === data.toUserId) {
    throw new AppError("Usuario nao pode avaliar a si mesmo", 400);
  }

  const ride = await prisma.ride.findUnique({
    where: { id: data.rideId },
    select: {
      driverId: true,
      date: true,
      departureTimeEnd: true,
      status: true,
      requests: {
        where: { status: "accepted" },
        select: { passengerId: true },
      },
    },
  });

  if (!ride) {
    throw new AppError("Carona nao encontrada", 404);
  }

  if (ride.status === "cancelled") {
    throw new AppError("Caronas canceladas nao podem ser avaliadas", 400);
  }

  if (
    ride.status !== "completed" &&
    !hasRideEnded(ride.date, ride.departureTimeEnd)
  ) {
    throw new AppError("A carona ainda nao terminou", 400);
  }

  const acceptedPassengerIds = new Set(
    ride.requests.map((request) => request.passengerId),
  );
  const driverIsRatingPassenger =
    fromUserId === ride.driverId && acceptedPassengerIds.has(data.toUserId);
  const passengerIsRatingDriver =
    acceptedPassengerIds.has(fromUserId) && data.toUserId === ride.driverId;

  if (!driverIsRatingPassenger && !passengerIsRatingDriver) {
    throw new AppError(
      "Avaliacao permitida apenas entre participantes da carona",
      403,
    );
  }
}

export async function createRating(
  fromUserId: string,
  data: CreateRatingInput,
) {
  await validateRatingParticipants(fromUserId, data);

  try {
    const rating = await prisma.$transaction(async (transaction) => {
      const createdRating = await transaction.rating.create({
        data: {
          fromUserId,
          toUserId: data.toUserId,
          rideId: data.rideId,
          rating: data.rating,
          comment: data.comment,
        },
        include: ratingInclude,
      });

      const result = await transaction.rating.aggregate({
        where: { toUserId: data.toUserId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await transaction.user.update({
        where: { id: data.toUserId },
        data: {
          rating: Number((result._avg.rating ?? 0).toFixed(1)),
          totalRatings: result._count.rating,
        },
      });

      return createdRating;
    });

    return formatRating(rating);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("Avaliacao ja enviada para esta carona", 409);
    }

    throw error;
  }
}

export async function listUserRatings(userId: string) {
  const ratings = await prisma.rating.findMany({
    where: { toUserId: userId },
    include: ratingInclude,
    orderBy: { createdAt: "desc" },
  });

  return ratings.map(formatRating);
}

export async function listRideRatings(rideId: string) {
  const ratings = await prisma.rating.findMany({
    where: { rideId },
    include: ratingInclude,
    orderBy: { createdAt: "desc" },
  });

  return ratings.map(formatRating);
}
