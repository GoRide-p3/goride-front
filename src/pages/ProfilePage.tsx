import {
  ArrowLeft,
  Star,
  User as UserIcon,
  MapPin,
  Menu,
  Phone,
  CreditCard,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { getCurrentUser } from "../utils/auth";
import { parseLocalDate, formatISODate } from "../utils/date";

interface LayoutContext {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
}

export function Profile() {
  const navigate = useNavigate();
  const { setSidebarOpen } = useOutletContext<LayoutContext>();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  if (!user) return null;

  const isPrivateMode = user.privateMode ?? false;

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const birth = parseLocalDate(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const age = calculateAge(user.birthDate ?? null);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return Array.from({ length: 5 }, (_, i) => {
      if (i < fullStars)
        return (
          <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        );
      if (i === fullStars && hasHalfStar)
        return (
          <div key={i} className="relative w-5 h-5">
            <Star className="w-5 h-5 text-gray-300 fill-gray-300 absolute" />
            <div className="overflow-hidden w-1/2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        );
      return (
        <Star key={i} className="w-5 h-5 text-gray-300 fill-gray-300" />
      );
    });
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col overflow-hidden">
      {/* Header */}
      <div className="w-full px-6 pt-12 pb-6 bg-primary text-primary-foreground flex-shrink-0 lg:px-8 lg:pt-8 lg:pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-background/10 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-background/10 rounded-lg transition-colors hidden lg:block"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Meu perfil</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 w-full">
        <div className="bg-background rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Avatar */}
          <div className="bg-gradient-to-br from-[#1D3557] to-[#2d4a6f] px-6 pt-8 pb-24 relative">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              <div className="w-32 h-32 bg-background rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="pt-20 px-6 pb-6">
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
                {user.name}
              </h2>
              <button
                onClick={() => navigate("/profile/ratings")}
                className="flex items-center justify-center gap-2 mb-4 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
              >
                <div className="flex items-center gap-1">
                  {renderStars(user.rating)}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {user.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({user.totalRatings}{" "}
                  {user.totalRatings === 1 ? "avaliação" : "avaliações"})
                </span>
              </button>
            </div>

            <div className="border-t border-gray-200 my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Gênero */}
              <div className="bg-[#F5F5F5] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                      Gênero
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {user.gender}
                    </p>
                  </div>
                </div>
              </div>

              {/* Idade */}
              {!isPrivateMode && age !== null && (
                <div className="bg-[#F5F5F5] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                        Idade
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {age} anos
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Telefone */}
              {!isPrivateMode && user.phone && (
                <div className="bg-[#F5F5F5] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                        Telefone
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {user.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PIX */}
              {!isPrivateMode && user.pix && (
                <div className="bg-[#F5F5F5] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                        Chave PIX
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {user.pix}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Membro desde */}
              {user.createdAt && (
                <div className="bg-[#F5F5F5] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#E63946] rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                        Membro desde
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {formatISODate(user.createdAt, {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mt-6 text-left">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Sobre mim
                </h3>
                <div className="bg-[#F5F5F5] rounded-xl p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {user.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Verificações */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-3 text-left">
                Verificações
              </h3>
              <div className="flex flex-wrap gap-2">
                <div
                  className={`px-4 py-2 rounded-full flex items-center gap-2 border ${
                    user.emailVerified
                      ? "bg-success border-success-border"
                      : "bg-gray-100 border-gray-200"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      user.emailVerified
                        ? "bg-success-foreground"
                        : "bg-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      user.emailVerified
                        ? "text-success-foreground"
                        : "text-gray-500"
                    }`}
                  >
                    {user.emailVerified
                      ? "E-mail verificado"
                      : "E-mail não verificado"}
                  </span>
                </div>
                <div className="px-4 py-2 bg-info border border-blue-200 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-info-foreground rounded-full" />
                  <span className="text-sm font-medium text-info-foreground">
                    Perfil completo
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {user.totalRatings}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Avaliações</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-xs text-gray-600 mt-1">Caronas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-xs text-gray-600 mt-1">Meses ativo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}