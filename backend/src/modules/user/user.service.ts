import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type { UpdateProfileInput } from "./user.schema.js";

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("Usuário não encontrado", 404);
  return user;
}

export async function updateProfile(id: string, data: UpdateProfileInput) {
  await getUserById(id);
  return prisma.user.update({
    where: { id },
    data,
  });
}