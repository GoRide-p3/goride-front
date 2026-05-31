import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import type { Gender } from "../types/user";
import { authService } from "../services/auth";
import { saveSession } from "../utils/auth";

const genderOptions: Gender[] = [
  "Feminino",
  "Masculino",
  "Outro",
  "Prefiro não declarar",
];

export function RegisterPage() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("Prefiro não declarar");
  const [birthDate, setBirthDate] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onlyDigits = (value: string) => value.replace(/\D/g, "");

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  function isValidCpf(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === Number(cpf[10]);
}

  const formatCpf = (value: string) => {
    const digits = onlyDigits(value).slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().split(" ").filter(Boolean).length < 2) {
      setError("Digite seu nome completo");
      return;
    }
    if (!birthDate) {
      setError("Digite sua data de nascimento");
      return;
    }
    if (!validateEmail(email)) {
      setError("Digite um e-mail válido");
      return;
    }
    if (!isValidCpf(onlyDigits(cpf))) {
      setError("CPF inválido");
      return;
    }
    if (onlyDigits(phone).length < 10) {
      setError("Digite um telefone válido");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      const { user, token } = await authService.register({
        name: name.trim(),
        email: email.trim(),
        cpf: onlyDigits(cpf),
        phone,
        gender,
        birthDate,
        password,
      });
      saveSession(user, token);
      navigate("/home");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta");
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-lg border-2 outline-none transition ${
      focusedField === field ? "border-primary" : "border-gray-200"
    }`;

  const isDisabled =
    !name || !gender || !birthDate || !cpf || !phone || !email || !password;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <div className="hidden lg:flex w-1/2 bg-primary text-primary-foreground items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">Criar conta</h1>
          <p className="text-lg opacity-90">
            Informe seus dados para começar a usar o GoRide.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-10 pb-6 lg:justify-center lg:px-20 lg:py-12">
        <div className="mb-6 lg:mb-8 flex flex-row gap-4">
          <Link to="/login">
            <button className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
          </Link>
          <h1 className="text-foreground text-3xl font-semibold mb-2">
            Cadastro
          </h1>
        </div>

        <div className="w-full max-w-md mx-auto">
          <p className="text-muted-foreground mb-8 text-base">
            Preencha seus dados para criar sua conta
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4 lg:mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField("")}
                  className={inputClass("name")}
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  CPF
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  onFocus={() => setFocusedField("cpf")}
                  onBlur={() => setFocusedField("")}
                  className={inputClass("cpf")}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="mb-4 lg:mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Gênero
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  onFocus={() => setFocusedField("gender")}
                  onBlur={() => setFocusedField("")}
                  className={inputClass("gender")}
                >
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Data de nascimento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  onFocus={() => setFocusedField("birthDate")}
                  onBlur={() => setFocusedField("")}
                  className={inputClass("birthDate")}
                />
              </div>
            </div>

            <div className="mb-4 lg:mb-5">
              <label className="block text-sm font-medium mb-2 text-foreground">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
                className={inputClass("email")}
                placeholder="seu@email.com"
              />
            </div>

            <div className="mb-4 lg:mb-5">
              <label className="block text-sm font-medium mb-2 text-foreground">
                Celular / telefone
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField("")}
                className={inputClass("phone")}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="mb-4 lg:mb-5">
              <label className="block text-sm font-medium mb-2 text-foreground">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
                className={inputClass("password")}
                placeholder="Digite sua senha"
              />
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className={`w-full py-4 rounded-2xl text-base font-semibold transition ${
                isDisabled
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-accent text-accent-foreground hover:bg-accent-hover active:scale-[0.98] cursor-pointer"
              }`}
            >
              Criar conta
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="font-semibold text-accent hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}