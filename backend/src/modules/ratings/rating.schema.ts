import { z } from "zod";

export const createRatingSchema = z.object({
  fromUserId: z.string().min(1),
  toUserId: z.string().min(1),
  rideId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>;
