import { z } from "zod";

export const updateRideRequestSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

export type UpdateRideRequestInput = z.infer<typeof updateRideRequestSchema>;
