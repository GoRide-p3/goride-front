import {
  ArrowLeft,
  Star,
  User as UserIcon,
  MessageSquare,
  Menu,
} from "lucide-react";
import { useNavigate, useParams, useOutletContext } from "react-router";
import { useState, useEffect } from "react";
import type { Rating } from "../types/rating";
import { formatISODate } from "../utils/date";
import { getCurrentUser } from "../utils/auth";
import { ratingsService } from "../services/ratings";
import { userService } from "../services/user";

interface LayoutContext {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
}

export function RatingsPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { setSidebarOpen } = useOutletContext<LayoutContext>();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"passenger" | "driver">(
    "passenger",
  );

  useEffect(() => {
    const currentUser = getCurrentUser();
    const profileUserId = userId ?? currentUser?.id;

    if (!profileUserId) {
      setRatings([]);
      setUserName("Usuario");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    Promise.all([
      userService.getById(profileUserId),
      ratingsService.listByUser(profileUserId),
    ])
      .then(([profileUser, apiRatings]) => {
        const mappedRatings: Rating[] = apiRatings.map((rating) => ({
          id: rating.id,
          raterId: rating.fromUser?.id ?? "",
          raterName: rating.fromUser?.name ?? "Usuario",
          ratedUserId: profileUserId,
          rating: rating.rating,
          comment: rating.comment ?? "",
          rideId: rating.ride?.id ?? "",
          createdAt: rating.createdAt,
          role:
            rating.ride?.driverId === profileUserId ? "driver" : "passenger",
        }));

        setUserName(profileUser.name);
        setRatings(mappedRatings);

        if (
          mappedRatings.some((rating) => rating.role === "driver") &&
          !mappedRatings.some((rating) => rating.role === "passenger")
        ) {
          setActiveTab("driver");
        } else {
          setActiveTab("passenger");
        }
      })
      .catch((error) => {
        setError(
          error instanceof Error ? error.message : "Erro ao carregar avaliacoes",
        );
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 text-yellow-500 fill-yellow-500"
          />,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-gray-300 fill-gray-300 absolute" />
            <div className="overflow-hidden w-1/2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </div>
          </div>,
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300 fill-gray-300" />,
        );
      }
    }

    return stars;
  };

  const formatDate = (dateString: string) =>
    formatISODate(dateString, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const driverRatings = ratings.filter((r) => r.role === "driver");
  const passengerRatings = ratings.filter((r) => r.role === "passenger");
  const activeRatings =
    activeTab === "passenger" ? passengerRatings : driverRatings;

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
      : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
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
          <h1 className="text-xl font-semibold">Avaliações</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* User Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                {userName}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {renderStars(averageRating)}
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {ratings.length}{" "}
                {ratings.length === 1 ? "avaliação" : "avaliações"}
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-sm text-gray-500">Carregando avaliacoes...</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Tabs */}
        {!loading && !error && (
          <div className="flex gap-2 mb-6 bg-background rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("passenger")}
            className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === "passenger"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Como passageiro
          </button>
          <button
            onClick={() => setActiveTab("driver")}
            className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === "driver"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Como motorista
          </button>
          </div>
        )}

        {!loading && !error && activeRatings.length > 0 && (
          <div className="space-y-4">
            {activeRatings.map((rating) => (
              <div
                key={rating.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/user/${rating.raterId}`)}
                    aria-label={`Abrir perfil de ${rating.raterName}`}
                    className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:bg-gray-200"
                  >
                    <UserIcon className="w-6 h-6 text-gray-500" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">
                        {rating.raterName}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatDate(rating.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(rating.rating)}
                    </div>
                    {rating.comment && (
                      <p className="text-sm text-gray-600 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        {rating.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && ratings.length > 0 && activeRatings.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma avaliação nesta aba
            </h3>
            <p className="text-sm text-gray-500">
              Este usuário ainda não recebeu avaliações como{" "}
              {activeTab === "passenger" ? "passageiro" : "motorista"}.
            </p>
          </div>
        )}

        {/* No Ratings */}
        {!loading && !error && ratings.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma avaliação ainda
            </h3>
            <p className="text-sm text-gray-500">
              Este usuário ainda não recebeu avaliações.
            </p>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="lg:hidden w-full py-3 bg-primary border border-gray-300 text-primary-foreground rounded-xl font-medium mt-6"
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
}
