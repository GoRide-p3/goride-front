import nodemailer from "nodemailer";

function requireEnvironmentVariable(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} deve ser definido para envio de e-mail`);
  }

  return value;
}

export async function sendPasswordResetEmail(input: {
  email: string;
  name: string;
  token: string;
}) {
  const host = requireEnvironmentVariable("SMTP_HOST");
  const from = requireEnvironmentVariable("SMTP_FROM");
  const frontendUrl = requireEnvironmentVariable("FRONTEND_URL");
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("SMTP_PORT deve ser uma porta valida");
  }

  if ((user && !pass) || (!user && pass)) {
    throw new Error("SMTP_USER e SMTP_PASS devem ser definidos em conjunto");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  const resetUrl = new URL("/reset-password", frontendUrl);
  resetUrl.searchParams.set("token", input.token);

  await transporter.sendMail({
    from,
    to: input.email,
    subject: "Redefinicao de senha - GoRide",
    text: [
      `Ola, ${input.name}.`,
      "",
      "Recebemos uma solicitacao para redefinir sua senha.",
      `Acesse o link a seguir em ate 15 minutos: ${resetUrl.toString()}`,
      "",
      "Se voce nao solicitou esta alteracao, ignore este e-mail.",
    ].join("\n"),
  });
}
