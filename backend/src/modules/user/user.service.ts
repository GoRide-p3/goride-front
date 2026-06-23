import { Prisma } from "@prisma/client";
import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type { UpdateProfileInput } from "./user.schema.js";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  gender: true,
  birthDate: true,
  bio: true,
  pix: true,
  avatar: true,
  privateMode: true,
  emailVerified: true,
  rating: true,
  totalRatings: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });
  if (!user) throw new AppError("Usuario nao encontrado", 404);
  return user;
}

export async function updateProfile(id: string, data: UpdateProfileInput) {
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new AppError("Usuario nao encontrado", 404);

  return prisma.user.update({
    where: { id },
    data,
    select: safeUserSelect,
  });
}
