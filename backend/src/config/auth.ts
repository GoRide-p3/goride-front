const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret === "dev-secret") {
  throw new Error("JWT_SECRET deve ser definido com uma chave segura");
}

export const JWT_SECRET = jwtSecret;
