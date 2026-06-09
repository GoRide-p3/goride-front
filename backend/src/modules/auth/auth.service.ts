import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../lib/app-error.js";
import { prisma } from "../../lib/prisma.js"
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "./auth.schema.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const SALT_ROUNDS = 10;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definido no .env");
}

function generateToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}

function generatePasswordResetToken(userId: string) {
  return jwt.sign(
    { sub: userId, purpose: "password-reset" },
    JWT_SECRET,
    { expiresIn: "15m" },
  );
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
      existing.email === data.email
        ? "Dados informados já estão vinculados a uma conta ativa."
        : "Dados informados já estão vinculados a uma conta ativa.",
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
    throw new AppError("E-mail ou senha inválidos", 401);
  }

  const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);

  if (!passwordMatch) {
    throw new AppError("E-mail ou senha inválidos", 401);
  }

  const token = generateToken(user.id);

  return { user: formatUser(user), token };
}

export async function forgotPassword(data: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });

  if (!user) {
    return {
      message: "Se o email existir, um link de redefinicao sera enviado.",
    };
  }

  const resetToken = generatePasswordResetToken(user.id);

  return {
    message: "Token de redefinicao gerado.",
    resetToken,
  };
}

export async function resetPassword(data: ResetPasswordInput) {
  try {
    const payload = jwt.verify(data.token, JWT_SECRET) as {
      sub: string;
      purpose?: string;
    };

    if (payload.purpose !== "password-reset") {
      throw new AppError("Token invalido", 401);
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    });

    return { message: "Senha atualizada com sucesso." };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Token invalido ou expirado", 401);
  }
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
