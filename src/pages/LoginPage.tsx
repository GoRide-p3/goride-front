import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { authService } from "../services/auth";
import { saveSession } from "../utils/auth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (!validateEmail(email)) {
    setError("Digite um e-mail válido");
    return;
  }

  if (password.length < 6) {
    setError("A senha deve ter pelo menos 6 caracteres");
    return;
  }

  try {
    const { user, token } = await authService.login({ email, password });
    saveSession(user, token);
    navigate("/home");
  } catch (error) {
    setError(error instanceof Error ? error.message : "Erro ao entrar");
  }
};

    
  const isDisabled = !email || !password;
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* LADO ESQUERDO - DESKTOP */}
      <div className="hidden lg:flex w-1/2 bg-primary text-primary-foreground items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo 👋</h1>
          <p className="text-lg opacity-90">
            Entre na sua conta e comece a encontrar caronas de forma simples e
            segura.
          </p>
        </div>
      </div>

      {/* LADO DIREITO */}
      <div
        className="flex-1 flex flex-col 
      px-6 pt-10 pb-6 
      lg:justify-center lg:px-20 lg:py-12"
      >
        {/* BOTÃO VOLTAR */}
        <div className="mb-6 lg:mb-8 flex flex-row gap-4">
          <Link to="/">
            <button className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
          </Link>
          <h1 className="text-foreground text-3xl font-semibold mb-2 lg:text-3xl">
            Entrar
          </h1>
        </div>

        <div className="w-full max-w-md mx-auto">
          

          <p className="text-gray-600 mb-8 text-base lg:text-base">
            Insira seu e-mail e senha para começar
          </p>

          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div className="mb-4 lg:mb-5">
              <label className="block text-sm font-medium mb-2 text-foreground">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className={`w-full px-4 py-4 rounded-xl border-2 outline-none transition ${
                  emailFocused ? "border-primary" : "border-gray-200"
                }`}
                placeholder="seu@email.com"
              />
            </div>

            {/* SENHA */}
            <div className="mb-4 lg:mb-5">
              <label className="block text-base font-medium mb-2 text-foreground">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition ${
                  passwordFocused ? "border-primary" : "border-gray-200"
                }`}
                placeholder="••••••••"
              />

              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </div>

            {/* ESQUECI SENHA */}
            <button
              type="button"
              className="text-sm text-accent mb-6 hover:underline"
              onClick={() => navigate("/forgot-password")}
            >
              Esqueceu a senha?
            </button>

            {/* BOTÃO */}
            <button
              type="submit"
              disabled={isDisabled}
              className={`w-full py-4 rounded-2xl text-base font-semibold transition
  ${
    isDisabled
      ? "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted-hover"
      : "bg-accent text-accent-foreground hover:bg-accent-hover active:scale-[0.98] cursor-pointer"
  }`}
            >
              Entrar
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Ainda não tem conta?{" "}
            <Link
              to="/register"
              className="font-semibold text-accent hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
