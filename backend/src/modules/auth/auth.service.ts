import bcrypt from "bcrypt";
import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/auth.js";
import { AppError } from "../../lib/app-error.js";
import { sendPasswordResetEmail } from "../../lib/mailer.js";
import { prisma } from "../../lib/prisma.js";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "./auth.schema.js";

const SALT_ROUNDS = 10;
const PASSWORD_RESET_EXPIRATION_MS = 15 * 60 * 1000;

function generateToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}

function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function formatUser(user: {
  id: string;
  name: string;
  email: string;
  gender: string;
  phone: string | null;
  birthDate: string | null;
  bio: string | null;
  pix: string | null;
  avatar: string | null;
  privateMode: boolean;
  emailVerified: boolean;
  rating: number;
  totalRatings: number;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    gender: user.gender,
    phone: user.phone,
    birthDate: user.birthDate,
    bio: user.bio,
    pix: user.pix,
    avatar: user.avatar,
    privateMode: user.privateMode,
    emailVerified: user.emailVerified,
    rating: user.rating,
    totalRatings: user.totalRatings,
    createdAt: user.createdAt,
  };
}

export async function register(data: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { cpf: data.cpf }],
    },
  });

  if (existing) {
    throw new AppError(
      "Dados informados ja estao vinculados a uma conta ativa.",
      409,
    );
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      phone: data.phone,
      gender: data.gender,
      birthDate: data.birthDate,
      passwordHash,
    },
  });

  const token = generateToken(user.id);

  return { user: formatUser(user), token };
}

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new AppError("E-mail ou senha invalidos", 401);
  }

  const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);

  if (!passwordMatch) {
    throw new AppError("E-mail ou senha invalidos", 401);
  }

  const token = generateToken(user.id);

  return { user: formatUser(user), token };
}

export async function forgotPassword(data: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true, email: true, name: true },
  });
  const message = "Se o email existir, um link de redefinicao sera enviado.";

  if (!user) {
    return { message };
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRATION_MS);
  const now = new Date();

  const resetToken = await prisma.$transaction(async (transaction) => {
    await transaction.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: { usedAt: now },
    });

    return transaction.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
      select: { id: true },
    });
  });

  try {
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      token,
    });
  } catch (error) {
    console.error("Falha ao enviar e-mail de redefinicao de senha", error);
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });
  }

  return { message };
}

export async function resetPassword(data: ResetPasswordInput) {
  const tokenHash = hashPasswordResetToken(data.token);
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    const resetToken = await transaction.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() <= now.getTime()
    ) {
      throw new AppError("Token invalido ou expirado", 401);
    }

    const consumed = await transaction.passwordResetToken.updateMany({
      where: {
        id: resetToken.id,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    });

    if (consumed.count !== 1) {
      throw new AppError("Token invalido ou expirado", 401);
    }

    await transaction.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    await transaction.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
      },
      data: { usedAt: now },
    });
  });

  return { message: "Senha atualizada com sucesso." };
}

export async function changePassword(userId: string, data: ChangePasswordInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("Usuario nao encontrado", 404);
  }

  const passwordMatch = await bcrypt.compare(
    data.currentPassword,
    user.passwordHash,
  );

  if (!passwordMatch) {
    throw new AppError("Senha atual incorreta", 401);
  }

  const passwordHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: "Senha alterada com sucesso." };
}
