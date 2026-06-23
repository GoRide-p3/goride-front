import { type ReactNode, useEffect, useState } from "react";
import {
  Menu,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  User,
  Users,
  Star,
  Calendar,
  Car,
  Navigation,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router";
import type {
  HistoryRideAsPassenger,
  HistoryRideAsDriver,
} from "../types/history";
import { formatLocalDate } from "../utils/date";
import { getCurrentUser } from "../utils/auth";
import { ridesService } from "../services/rides";

// — Types —

interface LayoutContext {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
}

type TabType = "offered" | "received";
type SortOrder = "recent" | "oldest";
type HistoryStatus = "active" | "completed" | "cancelled";
type StatusFilter = "all" | HistoryStatus;
type DirectionFilter = "all" | "to-ufal" | "from-ufal";

function EmptyState({
  icon,
  message,
}: {
  icon: ReactNode;
  message: string;
}) {
  return (
    <div className="bg-background rounded-2xl p-8 text-center shadow-sm border border-gray-100">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="text-foreground font-medium">{message}</p>
    </div>
  );
}

// — Component —

export function History() {
  const navigate = useNavigate();
  const { setSidebarOpen } = useOutletContext<LayoutContext>();
  const currentUser = getCurrentUser();

  // Tab
  const [activeTab, setActiveTab] = useState<TabType>("offered");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [sameGenderFilter, setSameGenderFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [timeStartFilter, setTimeStartFilter] = useState("");
  const [timeEndFilter, setTimeEndFilter] = useState("");
  const [directionFilter, setDirectionFilter] =
    useState<DirectionFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [driverHistory, setDriverHistory] = useState<HistoryRideAsDriver[]>([]);
  const [passengerHistory, setPassengerHistory] = useState<
    HistoryRideAsPassenger[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");

  // Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDriverRide, setSelectedDriverRide] =
    useState<HistoryRideAsDriver | null>(null);
  const [selectedPassengerRide, setSelectedPassengerRide] =
    useState<HistoryRideAsPassenger | null>(null);

  // Passengers accordion
  const [showPassengers, setShowPassengers] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setDriverHistory([]);
      setPassengerHistory([]);
      setLoadingHistory(false);
      return;
    }

    setLoadingHistory(true);
    setHistoryError("");

    ridesService
      .history()
      .then((history) => {
        setDriverHistory(
          history.offered.map((ride) => ({
            id: ride.id,
            date: ride.date,
            departureTimeStart: ride.departureTimeStart,
            departureTimeEnd: ride.departureTimeEnd,
            origin: ride.origin,
            destination: ride.destination,
            route: {
              name: ride.routeName ?? "Rota",
              distance: "-",
              duration: "-",
              waypoints: [ride.origin, ride.destination],
            },
            price: ride.price,
            totalSeats: ride.totalSeats,
            passengers: [],
            sameGenderOnly: ride.sameGenderOnly,
            status: ride.status,
          })),
        );

        setPassengerHistory(
          history.requested.map(({ ride }) => ({
            id: ride.id,
            date: ride.date,
            departureTimeStart: ride.departureTimeStart,
            departureTimeEnd: ride.departureTimeEnd,
            origin: ride.origin,
            destination: ride.destination,
            driver: {
              id: ride.driver?.id,
              name: ride.driver?.name ?? "Motorista",
              rating: ride.driver?.rating ?? 0,
              totalRatings: ride.driver?.totalRatings ?? 0,
              gender: ride.driver?.gender ?? "",
              phone: "",
            },
            price: ride.price,
            otherPassengers: [],
            sameGenderOnly: ride.sameGenderOnly,
            route: {
              name: ride.routeName ?? "Rota",
              distance: "-",
              duration: "-",
              waypoints: [ride.origin, ride.destination],
            },
            status: ride.status,
          })),
        );
      })
      .catch((error) => {
        setHistoryError(
          error instanceof Error ? error.message : "Erro ao carregar historico",
        );
      })
      .finally(() => setLoadingHistory(false));
  }, [currentUser?.id]);

  // — Helpers —

  const formatDate = (dateString: string) =>
    formatLocalDate(dateString, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const getRideStartTime = (ride: {
    date: string;
    departureTimeStart: string;
  }) => new Date(`${ride.date}T${ride.departureTimeStart}`).getTime();

  const getRideStartMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const isUfalLocation = (location: string) =>
    location.toLowerCase().includes("ufal");

  const matchesTimeFilter = (time: string) => {
    const minutes = getRideStartMinutes(time);

    if (timeStartFilter && minutes < getRideStartMinutes(timeStartFilter)) {
      return false;
    }

    if (timeEndFilter && minutes > getRideStartMinutes(timeEndFilter)) {
      return false;
    }

    return true;
  };

  const matchesDirectionFilter = (ride: {
    origin: string;
    destination: string;
  }) => {
    if (directionFilter === "to-ufal") return isUfalLocation(ride.destination);
    if (directionFilter === "from-ufal") return isUfalLocation(ride.origin);

    return true;
  };

  const filterHistoryRides = <
    Ride extends {
      origin: string;
      destination: string;
      departureTimeStart: string;
      sameGenderOnly: boolean;
      status: HistoryStatus;
    },
  >(
    rideList: Ride[],
  ) =>
    rideList.filter(
      (ride) =>
        (!sameGenderFilter || ride.sameGenderOnly) &&
        (statusFilter === "all" || ride.status === statusFilter) &&
        matchesTimeFilter(ride.departureTimeStart) &&
        matchesDirectionFilter(ride),
    );

  const hasActiveFilters =
    sameGenderFilter ||
    statusFilter !== "all" ||
    Boolean(timeStartFilter) ||
    Boolean(timeEndFilter) ||
    directionFilter !== "all";

  const clearFilters = () => {
    setSameGenderFilter(false);
    setStatusFilter("all");
    setTimeStartFilter("");
    setTimeEndFilter("");
    setDirectionFilter("all");
  };

  const sortHistoryRides = <
    Ride extends { date: string; departureTimeStart: string },
  >(
    rideList: Ride[],
  ) =>
    [...rideList].sort((a, b) => {
      const dateA = getRideStartTime(a);
      const dateB = getRideStartTime(b);

      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });

  const sortedDriverRides = sortHistoryRides(
    filterHistoryRides(driverHistory),
  );
  const sortedPassengerRides = sortHistoryRides(
    filterHistoryRides(passengerHistory),
  );

  // — Handlers —

  const handleDriverRideClick = (ride: HistoryRideAsDriver) => {
    setSelectedDriverRide(ride);
    setShowPassengers(false);
    setShowDetailsModal(true);
  };

  const handlePassengerRideClick = (ride: HistoryRideAsPassenger) => {
    setSelectedPassengerRide(ride);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedDriverRide(null);
    setSelectedPassengerRide(null);
  };

  // — Render —

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
          <h1 className="text-xl font-semibold">Histórico</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 lg:max-w-7xl lg:mx-auto lg:w-full">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-background rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("offered")}
              className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === "offered"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Caronas oferecidas
            </button>
            <button
              onClick={() => setActiveTab("received")}
              className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === "received"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Caronas solicitadas
            </button>
          </div>

          {loadingHistory && (
            <div className="bg-background rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <p className="text-muted-foreground">Carregando historico...</p>
            </div>
          )}

          {historyError && (
            <div className="bg-background rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <p className="text-destructive">{historyError}</p>
            </div>
          )}

          {!loadingHistory &&
            !historyError &&
            (activeTab === "offered"
              ? driverHistory.length
              : passengerHistory.length) > 0 && (
            <div className="mb-4 space-y-3">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-colors ${
                    showFilters || hasActiveFilters
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-gray-200 bg-background text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                  {showFilters ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Ordenar</span>
                  <div className="relative">
                    <select
                      value={sortOrder}
                      onChange={(event) =>
                        setSortOrder(event.target.value as SortOrder)
                      }
                      className="appearance-none rounded-lg border border-gray-200 bg-background py-2 pl-3 pr-9 text-sm text-gray-700 shadow-sm outline-none transition-colors hover:border-gray-300 focus:border-primary"
                    >
                      <option value="recent">Mais recentes</option>
                      <option value="oldest">Mais antigas</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  </div>
                </label>
              </div>

              {showFilters && (
                <div className="rounded-xl bg-background p-4 shadow-sm border border-gray-100">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="space-y-1 text-sm text-gray-600">
                      <span>Status</span>
                      <select
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value as StatusFilter)
                        }
                        className="w-full rounded-lg border border-gray-200 bg-background px-3 py-2 text-sm text-gray-700 outline-none transition-colors hover:border-gray-300 focus:border-primary"
                      >
                        <option value="all">Todas</option>
                        <option value="active">Em andamento</option>
                        <option value="completed">Concluídas</option>
                        <option value="cancelled">Canceladas</option>
                      </select>
                    </label>

                    <div className="space-y-1 text-sm text-gray-600">
                      <span>Horário</span>
                      <div className="grid grid-cols-2 gap-2">
                        <label
                          className="sr-only"
                          htmlFor="history-time-start-filter"
                        >
                          De
                        </label>
                        <input
                          id="history-time-start-filter"
                          type="time"
                          value={timeStartFilter}
                          onChange={(event) =>
                            setTimeStartFilter(event.target.value)
                          }
                          aria-label="Horário inicial"
                          className="w-full rounded-lg border border-gray-200 bg-background px-3 py-2 text-sm text-gray-700 outline-none transition-colors hover:border-gray-300 focus:border-primary"
                        />

                        <label
                          className="sr-only"
                          htmlFor="history-time-end-filter"
                        >
                          Até
                        </label>
                        <input
                          id="history-time-end-filter"
                          type="time"
                          value={timeEndFilter}
                          onChange={(event) =>
                            setTimeEndFilter(event.target.value)
                          }
                          aria-label="Horário final"
                          className="w-full rounded-lg border border-gray-200 bg-background px-3 py-2 text-sm text-gray-700 outline-none transition-colors hover:border-gray-300 focus:border-primary"
                        />
                      </div>
                    </div>

                    <label className="space-y-1 text-sm text-gray-600">
                      <span>Rota</span>
                      <select
                        value={directionFilter}
                        onChange={(event) =>
                          setDirectionFilter(
                            event.target.value as DirectionFilter,
                          )
                        }
                        className="w-full rounded-lg border border-gray-200 bg-background px-3 py-2 text-sm text-gray-700 outline-none transition-colors hover:border-gray-300 focus:border-primary"
                      >
                        <option value="all">Qualquer rota</option>
                        <option value="to-ufal">Para UFAL</option>
                        <option value="from-ufal">Saindo da UFAL</option>
                      </select>
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={sameGenderFilter}
                        onChange={(event) =>
                          setSameGenderFilter(event.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 accent-primary"
                      />
                      Apenas mesmo gênero
                    </label>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm font-medium text-accent hover:text-accent-hover"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Caronas oferecidas (motorista) */}
          {activeTab === "offered" && (
            <div className="space-y-4">
              {driverHistory.length === 0 ? (
                <EmptyState
                  icon={<Car className="w-8 h-8 text-gray-400" />}
                  message="Você ainda não ofereceu nenhuma carona"
                />
              ) : sortedDriverRides.length === 0 ? (
                <div className="bg-background rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                  <p className="text-foreground">
                    Nenhuma carona encontrada com os filtros selecionados.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 text-sm font-medium text-accent hover:text-accent-hover"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                sortedDriverRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    date={formatDate(ride.date)}
                    origin={ride.origin}
                    destination={ride.destination}
                    timeStart={ride.departureTimeStart}
                    timeEnd={ride.departureTimeEnd}
                    sameGenderOnly={ride.sameGenderOnly}
                    status={ride.status}
                    onClick={() => handleDriverRideClick(ride)}
                  />
                ))
              )}
            </div>
          )}

          {/* Tab: Caronas solicitadas (passageiro) */}
          {activeTab === "received" && (
            <div className="space-y-4">
              {passengerHistory.length === 0 ? (
                <EmptyState
                  icon={<Users className="w-8 h-8 text-gray-400" />}
                  message="Você ainda não pegou nenhuma carona"
                />
              ) : sortedPassengerRides.length === 0 ? (
                <div className="bg-background rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                  <p className="text-foreground">
                    Nenhuma carona encontrada com os filtros selecionados.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 text-sm font-medium text-accent hover:text-accent-hover"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                sortedPassengerRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    date={formatDate(ride.date)}
                    origin={ride.origin}
                    destination={ride.destination}
                    timeStart={ride.departureTimeStart}
                    timeEnd={ride.departureTimeEnd}
                    sameGenderOnly={ride.sameGenderOnly}
                    status={ride.status}
                    onClick={() => handlePassengerRideClick(ride)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalhes */}
      {showDetailsModal && (selectedDriverRide || selectedPassengerRide) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold">Detalhes da carona</h2>
              <button onClick={handleCloseModal}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detalhes: motorista */}
          {activeTab === "offered" && selectedDriverRide && (
              <DriverRideDetails
                ride={selectedDriverRide}
                formatDate={formatDate}
                showPassengers={showPassengers}
                onTogglePassengers={() => setShowPassengers((p) => !p)}
                navigate={navigate}
              />
            )}

            {/* Detalhes: passageiro */}
            {activeTab === "received" && selectedPassengerRide && (
              <PassengerRideDetails
                ride={selectedPassengerRide}
                formatDate={formatDate}
                navigate={navigate}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// — Sub-components —

// Card de carona (usado em ambas as tabs)
function RideCard({
  date,
  origin,
  destination,
  timeStart,
  timeEnd,
  sameGenderOnly,
  status,
  onClick,
}: {
  date: string;
  origin: string;
  destination: string;
  timeStart: string;
  timeEnd: string;
  sameGenderOnly: boolean;
  status: HistoryStatus;
  onClick: () => void;
}) {
  const statusInfo = {
    active: {
      label: "Em andamento",
      className: "bg-info text-info-foreground",
    },
    completed: {
      label: "Concluida",
      className: "bg-success text-success-foreground",
    },
    cancelled: {
      label: "Cancelada",
      className: "bg-destructive-muted text-destructive",
    },
  }[status];

  return (
    <button
      onClick={onClick}
      className="w-full bg-background rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
    >
      {/* Card header */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <h3 className="text-foreground text-lg">{date}</h3>
        {sameGenderOnly && (
          <span className="px-2 py-0.5 bg-info text-info-foreground text-xs font-medium rounded-full">
            Mesmo gênero
          </span>
        )}
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Rota */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{origin}</p>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{destination}</p>
        </div>
      </div>

      {/* Horário */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <Clock className="w-4 h-4 text-secondary-foreground" />
        <span className="text-sm text-muted-foreground">
          {timeStart} - {timeEnd}
        </span>
      </div>
    </button>
  );
}

// Conteúdo do modal para motorista
function DriverRideDetails({
  ride,
  formatDate,
  showPassengers,
  onTogglePassengers,
  navigate,
}: {
  ride: HistoryRideAsDriver;
  formatDate: (d: string) => string;
  showPassengers: boolean;
  onTogglePassengers: () => void;
  navigate: (path: string) => void;
}) {
  return (
    <>
      {/* Info grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{formatDate(ride.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm">
            {ride.departureTimeStart} - {ride.departureTimeEnd}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <span className="text-sm">R$ {ride.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm">
            {ride.passengers.length}/{ride.totalSeats} ocupados
          </span>
        </div>
      </div>

      {/* Rota */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Navigation className="w-5 h-5 text-foreground" />
          <h3 className="text-sm  text-foreground">
            {ride.route.name}
          </h3>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-secondary-foreground" />
            <span className="text-sm text-gray-700">{ride.route.distance}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-secondary-foreground" />
            <span className="text-sm text-gray-700">{ride.route.duration}</span>
          </div>
        </div>

        {/* Waypoints */}
        <p className="text-xs text-secondary-foreground mb-3 font-medium">
          Pontos de passagem:
        </p>
        <div className="space-y-2">
          {ride.route.waypoints.map((waypoint, index) => (
            <div key={index} className="flex items-center gap-3">
              {index === 0 ? (
                <div className="w-3 h-3 bg-primary rounded-full" />
              ) : index === ride.route.waypoints.length - 1 ? (
                <MapPin className="w-3 h-3 text-accent" />
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full ml-0.5" />
              )}
              <span className="text-sm text-gray-700">{waypoint}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Accordion de passageiros */}
      {ride.passengers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={onTogglePassengers}
            className="w-full flex items-center justify-between p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
          >
            <span className="text-sm text-foreground">
              Passageiros ({ride.passengers.length})
            </span>
            {showPassengers ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {showPassengers && (
            <div className="space-y-2 mt-3">
              {ride.passengers.map((passenger) => (
                <button
                  key={passenger.id}
                  onClick={() => navigate(`/user/${passenger.id}`)}
                  className="w-full flex items-center gap-3 p-3 bg-secondary rounded-xl hover:bg-gray-100 transition text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {passenger.name}
                    </p>

                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-warning-foreground" />
                      <span className="text-xs text-gray-700 font-medium">
                        {passenger.rating}
                      </span>

                      <span className="text-xs text-gray-500">
                        • {passenger.gender}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
// Conteúdo do modal para passageiro
function PassengerRideDetails({
  ride,
  formatDate,
  navigate,
}: {
  ride: HistoryRideAsPassenger;
  formatDate: (d: string) => string;
  navigate: (path: string) => void;
}) {
  const [showPassengers, setShowPassengers] = useState(false);

  return (
    <>
      {/* Info grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{formatDate(ride.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm">
            {ride.departureTimeStart} - {ride.departureTimeEnd}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <span className="text-sm">R$ {ride.price.toFixed(2)}</span>
        </div>
      </div>

      {/* Rota */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Navigation className="w-5 h-5 text-foreground" />
          <h3 className="text-sm text-foreground">
            {ride.route.name}
          </h3>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-secondary-foreground" />
            <span className="text-sm text-gray-700">{ride.route.distance}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-secondary-foreground" />
            <span className="text-sm text-gray-700">{ride.route.duration}</span>
          </div>
        </div>

        {/* Waypoints */}
        <p className="text-xs text-secondary-foreground mb-3 font-medium">
          Pontos de passagem:
        </p>
        <div className="space-y-2">
          {ride.route.waypoints.map((waypoint, index) => (
            <div key={index} className="flex items-center gap-3">
              {index === 0 ? (
                <div className="w-3 h-3 bg-primary rounded-full" />
              ) : index === ride.route.waypoints.length - 1 ? (
                <MapPin className="w-3 h-3 text-accent" />
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full ml-0.5" />
              )}
              <span className="text-sm text-gray-700">{waypoint}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Motorista */}
      <div className="mt-6 p-4 bg-primary/5 rounded-xl">
        <p className="text-xs text-secondary-foreground mb-2 font-medium">
          Motorista
        </p>
        <button
          onClick={() => ride.driver.id && navigate(`/user/${ride.driver.id}`)}
          className="w-full flex items-center gap-3 text-left hover:bg-primary/10 p-2 rounded-xl transition"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">
              {ride.driver.name}
            </p>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-500 text-warning-foreground" />
              <span className="text-sm font-medium text-gray-700">
                {ride.driver.rating}
              </span>
              <span className="text-xs text-secondary-foreground">
                ({ride.driver.totalRatings})
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Accordion de outros passageiros */}
      {ride.otherPassengers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => setShowPassengers((p) => !p)}
            className="w-full flex items-center justify-between p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
          >
            <span className="text-sm  text-foreground">
              Outros passageiros ({ride.otherPassengers.length})
            </span>
            {showPassengers ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {showPassengers && (
            <div className="space-y-2 mt-3">
              {ride.otherPassengers.map((passenger) => (
                <button
                  key={passenger.id}
                  onClick={() => navigate(`/user/${passenger.id}`)}
                  className="w-full flex items-center gap-3 p-3 bg-secondary rounded-xl hover:bg-gray-100 transition text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {passenger.name}
                    </p>

                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-warning-foreground" />
                      <span className="text-xs text-gray-700 font-medium">
                        {passenger.rating}
                      </span>

                      <span className="text-xs text-gray-500">
                        • {passenger.gender}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
