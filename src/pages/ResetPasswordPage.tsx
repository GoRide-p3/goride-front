import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { authService } from "../services/auth";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!token) {
      setError("Link de redefinicao invalido.");
      return;
    }

    if (password.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setError("As senhas nao conferem.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await authService.resetPassword({ token, password });
      setSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Erro ao alterar senha",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-foreground mb-3">
          Criar nova senha
        </h1>
        <p className="text-muted-foreground mb-8">
          Escolha uma nova senha para acessar sua conta.
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nova senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirmar nova senha
              </label>
              <input
                type="password"
                required
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full py-4 rounded-xl font-semibold text-accent-foreground bg-accent hover:bg-accent-hover disabled:opacity-60"
            >
              {isSubmitting ? "Salvando..." : "Alterar senha"}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <p className="text-foreground">
              Sua senha foi atualizada com sucesso.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-accent text-accent-foreground rounded-xl font-medium"
            >
              Entrar
            </button>
          </div>
        )}

        {!success && (
          <Link
            to="/login"
            className="block text-center text-sm text-muted-foreground mt-6"
          >
            Voltar para login
          </Link>
        )}
      </div>
    </div>
  );
}
