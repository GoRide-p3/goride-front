import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateRatingInput } from "./rating.schema.js";

function formatUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    rating: user.rating,
    totalRatings: user.totalRatings,
  };
}

function formatRating(rating: any) {
  return {
    id: rating.id,
    rating: rating.rating,
    comment: rating.comment,
    createdAt: rating.createdAt,
    fromUser: rating.fromUser ? formatUser(rating.fromUser) : undefined,
    toUser: rating.toUser ? formatUser(rating.toUser) : undefined,
    ride: rating.ride,
  };
}

async function updateUserRating(userId: string) {
  const result = await prisma.rating.aggregate({
    where: { toUserId: userId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      rating: Number((result._avg.rating ?? 0).toFixed(1)),
      totalRatings: result._count.rating,
    },
  });
}

export async function createRating(data: CreateRatingInput) {
  if (data.fromUserId === data.toUserId) {
    throw new AppError("Usuario nao pode avaliar a si mesmo", 400);
  }

  const [fromUser, toUser, ride] = await Promise.all([
    prisma.user.findUnique({ where: { id: data.fromUserId } }),
    prisma.user.findUnique({ where: { id: data.toUserId } }),
    prisma.ride.findUnique({ where: { id: data.rideId } }),
  ]);

  if (!fromUser) throw new AppError("Usuario avaliador nao encontrado", 404);
  if (!toUser) throw new AppError("Usuario avaliado nao encontrado", 404);
  if (!ride) throw new AppError("Carona nao encontrada", 404);

  const existing = await prisma.rating.findUnique({
    where: {
      fromUserId_toUserId_rideId: {
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        rideId: data.rideId,
      },
    },
  });

  if (existing) {
    throw new AppError("Avaliacao ja enviada para esta carona", 409);
  }

  const rating = await prisma.rating.create({
    data,
    include: {
      fromUser: true,
      toUser: true,
      ride: true,
    },
  });

  await updateUserRating(data.toUserId);

  return formatRating(rating);
}

export async function listUserRatings(userId: string) {
  const ratings = await prisma.rating.findMany({
    where: { toUserId: userId },
    include: {
      fromUser: true,
      ride: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return ratings.map(formatRating);
}

export async function listRideRatings(rideId: string) {
  const ratings = await prisma.rating.findMany({
    where: { rideId },
    include: {
      fromUser: true,
      toUser: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return ratings.map(formatRating);
}
