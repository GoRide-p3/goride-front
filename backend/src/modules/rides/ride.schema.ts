import { z } from "zod";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use o formato HH:mm");

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato YYYY-MM-DD");

const statusSchema = z.enum(["active", "completed", "cancelled"]);

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Validacao para criar uma carona.
export const createRideSchema = z
  .object({
    origin: z.string().trim().min(2),
    destination: z.string().trim().min(2),
    date: dateSchema,
    departureTimeStart: timeSchema,
    departureTimeEnd: timeSchema,
    price: z.coerce.number().min(0),
    totalSeats: z.coerce.number().int().min(1).max(4),
    availableSeats: z.coerce.number().int().min(0).optional(),
    routeId: z.string().trim().optional(),
    routeName: z.string().trim().optional(),
    sameGenderOnly: z.coerce.boolean().default(false),
  })
  .superRefine((data, context) => {
    if (toMinutes(data.departureTimeEnd) < toMinutes(data.departureTimeStart)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O horario final deve ser maior ou igual ao inicial",
        path: ["departureTimeEnd"],
      });
    }

    if (
      data.availableSeats !== undefined &&
      data.availableSeats > data.totalSeats
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As vagas disponiveis nao podem superar o total de vagas",
        path: ["availableSeats"],
      });
    }
  });

// Na edicao todos os campos sao opcionais.
export const updateRideSchema = z
  .object({
    origin: z.string().trim().min(2).optional(),
    destination: z.string().trim().min(2).optional(),
    date: dateSchema.optional(),
    departureTimeStart: timeSchema.optional(),
    departureTimeEnd: timeSchema.optional(),
    price: z.coerce.number().min(0).optional(),
    totalSeats: z.coerce.number().int().min(1).max(4).optional(),
    availableSeats: z.coerce.number().int().min(0).optional(),
    routeId: z.string().trim().optional(),
    routeName: z.string().trim().optional(),
    sameGenderOnly: z.coerce.boolean().optional(),
    status: statusSchema.optional(),
  })
  .superRefine((data, context) => {
    if (
      data.departureTimeStart &&
      data.departureTimeEnd &&
      toMinutes(data.departureTimeEnd) < toMinutes(data.departureTimeStart)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O horario final deve ser maior ou igual ao inicial",
        path: ["departureTimeEnd"],
      });
    }

    if (
      data.availableSeats !== undefined &&
      data.totalSeats !== undefined &&
      data.availableSeats > data.totalSeats
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As vagas disponiveis nao podem superar o total de vagas",
        path: ["availableSeats"],
      });
    }
  });

export const listRidesQuerySchema = z.object({
  origin: z.string().trim().optional(),
  destination: z.string().trim().optional(),
  date: dateSchema.optional(),
  timeStart: timeSchema.optional(),
  timeEnd: timeSchema.optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sameGenderOnly: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  driverId: z.string().trim().optional(),
  status: statusSchema.optional(),
});

export type CreateRideInput = z.infer<typeof createRideSchema>;
export type UpdateRideInput = z.infer<typeof updateRideSchema>;
export type ListRidesQuery = z.infer<typeof listRidesQuerySchema>;
