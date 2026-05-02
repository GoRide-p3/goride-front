import { Car } from "lucide-react";
import { Link } from "react-router";
import illustration from "../assets/ride.png";

export function Onboarding() {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <div className="hidden lg:flex w-1/2 bg-background items-center justify-center p-12">
        <img
          src={illustration}
          alt="Ilustracao de carona"
          className="max-w-md w-full"
        />
      </div>

      <div
        className="flex-1 px-6 pt-12 pb-10 flex flex-col items-center text-center
        lg:justify-center lg:px-20 lg:py-12"
      >
        <div className="mb-8 pt-16 flex items-center gap-3 lg:pt-0">
          <h1 className="text-black text-4xl font-bold lg:text-5xl">
            GoRide
          </h1>

          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center bg-primary shadow-lg">
            <Car className="w-8 h-8 text-primary-foreground lg:w-10 lg:h-10" />
          </div>
        </div>

        <h2 className="text-foreground text-3xl font-semibold max-w-sm mt-6 lg:text-4xl lg:max-w-md">
          Peça uma carona em minutos
        </h2>

        <p className="text-gray-600 text-base max-w-md leading-relaxed mt-6 lg:text-lg">
          Viaje com seguranca e economia. Conecte-se com motoristas verificados
          da sua regiao.
        </p>

        <div className="flex-1" />

        <p className="text-xs text-secondary-foreground leading-relaxed mb-6 max-w-sm lg:text-sm">
          Ao continuar, voce concorda com os{" "}
          <a href="#" className="font-medium underline text-foreground">
            Termos de Uso
          </a>{" "}
          e{" "}
          <a href="#" className="font-medium underline text-foreground">
            Politica de Privacidade
          </a>
        </p>

        <Link to="/login" className="w-full max-w-sm">
          <button
            className="w-full py-4 rounded-xl font-semibold text-muted-foreground bg-muted
            hover:bg-muted-hover active:scale-[0.98] transition-all duration-200 lg:max-w-xs"
          >
            Continuar
          </button>
        </Link>
      </div>
    </div>
  );
}
