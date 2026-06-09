import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  pix: z.string().optional(),
  avatar: z.string().url().optional().nullable(),
  privateMode: z.boolean().optional(), 
  birthDate: z.string().optional(),    
  gender: z.string().optional(),       
  email: z.string().email().optional(), 
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;