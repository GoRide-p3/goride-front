import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { authService } from "../services/auth";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setIsSubmitting(true);

    try {
      const result = await authService.forgotPassword({ email });
      setSuccessMessage(result.message);

      if (result.resetToken) {
        setResetToken(result.resetToken);
      } else {
        setShowSuccess(true);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Erro ao recuperar senha",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas nao conferem");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result = await authService.resetPassword({
        token: resetToken,
        password: newPassword,
      });
      setSuccessMessage(result.message);
      setShowSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao alterar senha");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col lg:flex-row">
        <div className="hidden lg:flex w-1/2 bg-primary text-primary-foreground items-center justify-center p-12">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4">Bem-vindo</h1>
            <p className="text-lg opacity-90">
              Entre na sua conta e comece a encontrar caronas de forma simples e
              segura.
            </p>
          </div>
        </div>

        <div className="flex-1 px-6 pt-10 pb-6 flex flex-col lg:justify-center lg:px-20 lg:py-12">
          <div className="mb-6 lg:mb-8 flex items-center gap-4">
            <Link to="/login">
              <button className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                <ArrowLeft className="w-6 h-6 text-foreground" />
              </button>
            </Link>

            <h1 className="text-foreground text-3xl font-semibold">
              Recuperar senha
            </h1>
          </div>

          <div className="w-full max-w-md mx-auto">
            <p className="text-gray-600 mb-8">
              Informe seu e-mail para iniciar a recuperacao da senha.
            </p>

            {!resetToken ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="seuemail@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-semibold text-accent-foreground bg-accent hover:bg-accent-hover active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
                >
                  {isSubmitting ? "Enviando..." : "Enviar instrucoes"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
                  Token recebido da API para demonstracao. Em producao, ele
                  chegaria por e-mail.
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nova senha
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirmar nova senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-semibold text-accent-foreground bg-accent hover:bg-accent-hover active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
                >
                  {isSubmitting ? "Salvando..." : "Alterar senha"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full text-center">
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              Tudo certo!
            </h2>

            <p className="text-muted-foreground mb-6">
              {successMessage || "Operacao concluida com sucesso."}
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-accent text-accent-foreground rounded-xl font-medium hover:bg-accent-hover transition-colors"
            >
              Voltar para login
            </button>
          </div>
        </div>
      )}
    </>
  );
}
