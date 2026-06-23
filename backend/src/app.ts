import cors from "cors";
import express from "express";
import { AppError } from "./lib/app-error.js";
import { ridesRouter } from "./modules/rides/rides.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { userRouter } from "./modules/user/user.routes.js";
import { rideRequestsRouter } from "./modules/ride-request/ride-request.routes.js";
import { ratingsRouter } from "./modules/ratings/ratings.routes.js";

const defaultCorsOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const configuredCorsOrigins =
  process.env.CORS_ORIGIN?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const corsOrigins =
  process.env.NODE_ENV === "production" && configuredCorsOrigins.length > 0
    ? configuredCorsOrigins
    : Array.from(new Set([...defaultCorsOrigins, ...configuredCorsOrigins]));

export const app = express();

app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "goride-backend",
  });
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/rides", ridesRouter);
app.use("/ratings", ratingsRouter);
app.use("/", rideRequestsRouter);

app.use((_request, response) => {
  response.status(404).json({ message: "Rota nao encontrada" });
});

app.use(
  (
    error: Error,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof AppError) {
      response.status(error.statusCode).json({ message: error.message });
      return;
    }

    console.error(error);
    response.status(500).json({ message: "Erro interno do servidor" });
  },
);
