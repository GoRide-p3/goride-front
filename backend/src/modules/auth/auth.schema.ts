import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos sem formatação"),
  phone: z.string().optional(),
  gender: z.string().min(1),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual e obrigatoria"),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
