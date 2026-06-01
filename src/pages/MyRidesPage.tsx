import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Users,
  User,
  Star,
  Calendar,
  Navigation,
  Trash2,
  Check,
  X,
  Phone,
  AlertCircle,
  CheckCircle2,
  Menu,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router";
import type {
  MyRide,
  PassengerRequest,
  MyRideAsPassenger,
} from "../types/my-ride";
import { ChatModal } from "./ChatModal";
import { RatingModal } from "./RatingModal";
import { formatLocalDate } from "../utils/date";
import { ridesService } from "../services/rides";
import { getCurrentUser } from "../utils/auth";
import { rideRequestsService } from "../services/ride-request";

interface LayoutContext {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
}

type ModalType =
  | "delete"
  | "requests"
  | "complete"
  | "cancel-passenger"
  | "details"
  | "remove-passenger"
  | null;

type TabType = "offered" | "received";
type SortOrder = "soonest" | "latest";
type StatusFilter = "all" | "confirmed" | "pending";
type DirectionFilter = "all" | "to-ufal" | "from-ufal";

export function MyRides() {
  const navigate = useNavigate();
  const [processingRequest, setProcessingRequest] = useState<string | null>(
    null,
  );
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);
  const [ratingSuccessText, setRatingSuccessText] = useState("");
  const [requestAction, setRequestAction] = useState<
    "accept" | "reject" | null
  >(null);
  const { setSidebarOpen } = useOutletContext<LayoutContext>();
  const [activeTab, setActiveTab] = useState<TabType>("offered");
  const [sortOrder, setSortOrder] = useState<SortOrder>("soonest");
  const [sameGenderFilter, setSameGenderFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [timeStartFilter, setTimeStartFilter] = useState("");
  const [timeEndFilter, setTimeEndFilter] = useState("");
  const [directionFilter, setDirectionFilter] =
    useState<DirectionFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [rides, setRides] = useState<MyRide[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) return;

    ridesService
      .list({ driverId: currentUser.id, status: "active" })
      .then(async (data) => {
        const ridesWithRequests = await Promise.all(
          data.map(async (ride: any) => {
            const requests = await rideRequestsService.listByRide(ride.id);
            
            return {
              id: ride.id,
              origin: ride.origin,
              destination: ride.destination,
              date: ride.date,
              departureTimeStart: ride.departureTimeStart,
              departureTimeEnd: ride.departureTimeEnd,
              price: ride.price,
              totalSeats: ride.totalSeats,
              availableSeats: ride.availableSeats,
              routeId: ride.routeId ?? "",
              routeName: ride.routeName ?? "Rota",
              sameGenderOnly: ride.sameGenderOnly,
              status: ride.status,
              driverRatingsGiven: false,
              createdAt: ride.createdAt,
              
              requests: requests
                .filter((r: any) => r.status === "pending")
                .map((r: any) => ({
                  id: r.id,
                  passenger: {
                    id: r.passenger.id,
                    name: r.passenger.name,
                    rating: r.passenger.rating,
                    totalRatings: r.passenger.totalRatings,
                    gender: r.passenger.gender,
                    phone: r.passenger.phone ?? "",
                  },
                  status: r.status,
                  requestedAt: r.createdAt,
                })),
              
              confirmedPassengers: requests
                .filter((r: any) => r.status === "accepted")
                .map((r: any) => ({
                  id: r.id,
                  passenger: {
                    id: r.passenger.id,
                    name: r.passenger.name,
                    rating: r.passenger.rating,
                    totalRatings: r.passenger.totalRatings,
                    gender: r.passenger.gender,
                    phone: r.passenger.phone ?? "",
                  },
                  status: "accepted" as const,
                  requestedAt: r.createdAt,
                })),
            };
          }),
        );

        setRides(ridesWithRequests);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    rideRequestsService
      .listByPassenger(currentUser.id)
      .then((data) => {
        const mapped: MyRideAsPassenger[] = data.map((request: any) => ({
          id: request.id,
          origin: request.ride.origin,
          destination: request.ride.destination,
          date: request.ride.date,
          departureTimeStart: request.ride.departureTimeStart,
          departureTimeEnd: request.ride.departureTimeEnd,
          price: request.ride.price,
          totalSeats: request.ride.totalSeats,
          availableSeats: request.ride.availableSeats,
          routeId: request.ride.routeId ?? "",
          routeName: request.ride.routeName ?? "Rota",
          sameGenderOnly: request.ride.sameGenderOnly,
          status: request.status === "accepted"
            ? "confirmed"
            : request.status === "rejected"
              ? "cancelled"
              : "pending",
          driver: {
            id: request.ride.driver.id,
            name: request.ride.driver.name,
            rating: request.ride.driver.rating,
            totalRatings: request.ride.driver.totalRatings,
            phone: request.ride.driver.phone ?? "",
          },
          otherPassengers: [],
          passengerRatingGiven: undefined,
          requestedAt: request.createdAt,
          createdAt: request.createdAt,
        }));

        setRidesAsPassenger(mapped);
      })
      .catch(console.error);
  }, []);

  const [ridesAsPassenger, setRidesAsPassenger] = useState<MyRideAsPassenger[]>([]);
  const [selectedRide, setSelectedRide] = useState<MyRide | null>(null);
  const [selectedPassengerRide, setSelectedPassengerRide] =
    useState<MyRideAsPassenger | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [expandedRides, setExpandedRides] = useState<Set<string>>(new Set());
  const [showPassengers, setShowPassengers] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState<{
    id: string;
    name: string;
    rating: number;
  } | null>(null);
  const [chatRideInfo, setChatRideInfo] = useState<{
    date: string;
    origin: string;
    destination: string;
  } | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [currentRatingUser, setCurrentRatingUser] = useState<{
    id: string;
    name: string;
    rating: number;
  } | null>(null);
  const [currentRatingType, setCurrentRatingType] = useState<
    "driver" | "passenger"
  >("passenger");
  const [passengersToRate, setPassengersToRate] = useState<PassengerRequest[]>(
    [],
  );
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);
  const [selectedPassengerToRemove, setSelectedPassengerToRemove] =
    useState<PassengerRequest | null>(null);
  const isRidePast = (date: string, timeEnd: string): boolean => {
    const now = new Date();
    const rideDateTime = new Date(`${date}T${timeEnd}`);
    return rideDateTime < now;
  };

  const getHoursUntilRide = (date: string, timeStart: string): number => {
    const now = new Date();
    const rideDateTime = new Date(`${date}T${timeStart}`);
    const diffMs = rideDateTime.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60);
  };

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

  const matchesReceivedStatusFilter = (ride: MyRideAsPassenger) => {
    if (statusFilter === "confirmed") return ride.status === "confirmed";
    if (statusFilter === "pending") return ride.status === "pending";

    return true;
  };

  const filterOfferedRides = (rideList: MyRide[]) =>
    rideList.filter(
      (ride) =>
        (!sameGenderFilter || ride.sameGenderOnly) &&
        matchesTimeFilter(ride.departureTimeStart) &&
        matchesDirectionFilter(ride),
    );

  const filterReceivedRides = (rideList: MyRideAsPassenger[]) =>
    rideList.filter(
      (ride) =>
        (!sameGenderFilter || ride.sameGenderOnly) &&
        matchesReceivedStatusFilter(ride) &&
        matchesTimeFilter(ride.departureTimeStart) &&
        matchesDirectionFilter(ride),
    );

  const hasActiveFilters =
    sameGenderFilter ||
    (activeTab === "received" && statusFilter !== "all") ||
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

  const sortRidesByDate = <
    Ride extends { date: string; departureTimeStart: string },
  >(
    rideList: Ride[],
  ) =>
    [...rideList].sort((a, b) => {
      const dateA = getRideStartTime(a);
      const dateB = getRideStartTime(b);

      return sortOrder === "soonest" ? dateA - dateB : dateB - dateA;
    });

  const handleDeleteRide = async (rideId: string) => {
  const ride = rides.find((r) => r.id === rideId);
  if (!ride) return;

  const hoursUntilRide = getHoursUntilRide(ride.date, ride.departureTimeStart);
  const hasConfirmedPassengers = ride.confirmedPassengers.length > 0;

  if (hoursUntilRide < 6 && hoursUntilRide > 0 && hasConfirmedPassengers) {
    console.log("Penalidade aplicada: -0.1 na nota do usuário");
  }

  try {
    await ridesService.remove(rideId);
    setRides(rides.filter((r) => r.id !== rideId));
    setModalType(null);
    setSelectedRide(null);
    setRatingSuccessText("Carona deletada com sucesso!");
    setShowRatingSuccess(true);
  } catch (error) {
    console.error("Erro ao deletar carona:", error);
    setRatingSuccessText("Erro ao deletar carona. Tente novamente.");
    setShowRatingSuccess(true);
  }
};

  const handleCompleteRide = (ride: MyRide) => {
    setSelectedRide(ride);

    if (ride.confirmedPassengers.length === 0) {
      setModalType("delete");
      return;
    }

    setPassengersToRate(ride.confirmedPassengers);
    setCurrentPassengerIndex(0);
    setModalType("complete");

    openRatingModal(ride.confirmedPassengers[0].passenger, "passenger", {
      date: ride.date,
      origin: ride.origin,
      destination: ride.destination,
    });
  };

  const handleCompletePassengerRide = (ride: MyRideAsPassenger) => {
    setSelectedPassengerRide(ride);
    openRatingModal(ride.driver, "driver", {
      date: ride.date,
      origin: ride.origin,
      destination: ride.destination,
    });
  };

  const openRatingModal = (
    user: { id: string; name: string; rating: number },
    type: "driver" | "passenger",
    rideInfo: { date: string; origin: string; destination: string },
  ) => {
    setCurrentRatingUser(user);
    setCurrentRatingType(type);
    setChatRideInfo(rideInfo);
    setRatingModalOpen(true);
  };

  const handleSubmitRating = (
    rating: number,
    comment: string,
    reportReason?: string,
  ) => {
    console.log("Avaliação submetida:", {
      rating,
      comment,
      user: currentRatingUser,
      reportReason,
    });

    // MOTORISTA avaliando passageiros
    if (modalType === "complete" && selectedRide) {
      const nextIndex = currentPassengerIndex + 1;

      // ainda existem passageiros para avaliar
      if (nextIndex < passengersToRate.length) {
        setCurrentPassengerIndex(nextIndex);

        openRatingModal(passengersToRate[nextIndex].passenger, "passenger", {
          date: selectedRide.date,
          origin: selectedRide.origin,
          destination: selectedRide.destination,
        });

        return;
      }

      // terminou todos passageiros
      setRides(rides.filter((r) => r.id !== selectedRide.id));

      setRatingModalOpen(false);

      setRatingSuccessText(
        "Carona concluída e avaliações enviadas com sucesso!",
      );
      setShowRatingSuccess(true);

      setModalType(null);
      setSelectedRide(null);
      setPassengersToRate([]);
      setCurrentPassengerIndex(0);

      return;
    }

    // PASSAGEIRO avaliando motorista
    if (selectedPassengerRide) {
      setRidesAsPassenger(
        ridesAsPassenger.filter((r) => r.id !== selectedPassengerRide.id),
      );

      setRatingModalOpen(false);

      setRatingSuccessText("Avaliação enviada com sucesso!");
      setShowRatingSuccess(true);

      setSelectedPassengerRide(null);
    }
  };

  const handleCancelPassengerRide = (rideId: string) => {
    const ride = ridesAsPassenger.find((r) => r.id === rideId);
    if (!ride) return;

    const hoursUntilRide = getHoursUntilRide(
      ride.date,
      ride.departureTimeStart,
    );

    if (hoursUntilRide < 6 && hoursUntilRide > 0) {
      console.log(
        "Penalidade aplicada: -0.1 na nota do usuário por cancelamento de carona recebida",
      );
    }

    setRidesAsPassenger(ridesAsPassenger.filter((r) => r.id !== rideId));

    setModalType(null);
    setSelectedPassengerRide(null);

    setRatingSuccessText("Carona cancelada com sucesso!");
    setShowRatingSuccess(true);
  };

  const handleAcceptRequest = (rideId: string, requestId: string) => {
    setProcessingRequest(requestId);
    setRequestAction("accept");

    rideRequestsService
      .update(requestId, "accepted", currentUser!.id) 
      .then(() => {
        const updatedRides = rides.map((ride) => {
          if (ride.id === rideId) {
            const request = ride.requests.find((r) => r.id === requestId);
            if (request && ride.availableSeats > 0) {
              return {
                ...ride,
                requests: ride.requests.filter((r) => r.id !== requestId),
                confirmedPassengers: [
                  ...ride.confirmedPassengers,
                  { ...request, status: "accepted" as const },
                ],
                availableSeats: ride.availableSeats - 1,
              };
            }
          }
          return ride;
        });
        setRides(updatedRides);
        setSelectedRide(updatedRides.find((r) => r.id === rideId) || null);
      })
      .catch(console.error)
      .finally(() => {
        setProcessingRequest(null);
        setRequestAction(null);
      });
  };

const handleRejectRequest = (rideId: string, requestId: string) => {
  setProcessingRequest(requestId);
  setRequestAction("reject");

  rideRequestsService
    .update(requestId, "rejected", currentUser!.id) 
    .then(() => {
      const updatedRides = rides.map((ride) =>
        ride.id === rideId
          ? { ...ride, requests: ride.requests.filter((r) => r.id !== requestId) }
          : ride,
      );
      setRides(updatedRides);
      setSelectedRide(updatedRides.find((r) => r.id === rideId) || null);
    })
    .catch(console.error)
    .finally(() => {
      setProcessingRequest(null);
      setRequestAction(null);
    });
};

  const handleRemovePassenger = (rideId: string, passengerId: string) => {
    setRides(
      rides.map((ride) =>
        ride.id === rideId
          ? {
              ...ride,
              confirmedPassengers: ride.confirmedPassengers.filter(
                (p) => p.id !== passengerId,
              ),
              availableSeats: ride.availableSeats + 1,
            }
          : ride,
      ),
    );

    setModalType(null);
    setSelectedPassengerToRemove(null);

    setRatingSuccessText("Passageiro removido com sucesso!");
    setShowRatingSuccess(true);
  };

  const formatDate = (dateString: string) => {
    return formatLocalDate(dateString, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const toggleRideExpansion = (rideId: string) => {
    setExpandedRides((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rideId)) {
        newSet.delete(rideId);
      } else {
        newSet.add(rideId);
      }
      return newSet;
    });
  };

  const openChat = (
    user: { id: string; name: string; rating: number },
    rideInfo: { date: string; origin: string; destination: string },
  ) => {
    setChatUser(user);
    setChatRideInfo(rideInfo);
    setChatOpen(true);
  };

  const openOfferedRideDetails = (ride: MyRide) => {
    setSelectedPassengerRide(null);
    setSelectedRide(ride);
    setShowPassengers(false);
    setModalType("details");
  };

  const openReceivedRideDetails = (ride: MyRideAsPassenger) => {
    setSelectedRide(null);
    setSelectedPassengerRide(ride);
    setShowPassengers(false);
    setModalType("details");
  };

  const closeDetailsModal = () => {
    setModalType(null);
    setSelectedRide(null);
    setSelectedPassengerRide(null);
    setShowPassengers(false);
  };

  const displayedOfferedRides = sortRidesByDate(filterOfferedRides(rides));
  const displayedReceivedRides = sortRidesByDate(
    filterReceivedRides(ridesAsPassenger),
  );
  const selectedDetailsRide = selectedRide ?? selectedPassengerRide;
  const selectedDetailsOccupiedSeats = selectedRide
    ? selectedRide.confirmedPassengers.length
    : selectedPassengerRide
      ? selectedPassengerRide.totalSeats - selectedPassengerRide.availableSeats
      : 0;

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
          <h1 className="text-xl font-semibold">Em andamento</h1>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 lg:max-w-7xl lg:mx-auto lg:w-full">
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

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500 text-sm">Carregando caronas...</p>
          </div>
        ) : (
          <>

        {(activeTab === "offered" ? rides.length : ridesAsPassenger.length) >
          0 && (
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
                    <option value="soonest">Mais próximas</option>
                    <option value="latest">Mais distantes</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </label>
            </div>

            {showFilters && (
              <div className="rounded-xl bg-background p-4 shadow-sm border border-gray-100">
                <div className="grid gap-3 sm:grid-cols-3">
                  {activeTab === "received" && (
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
                        <option value="confirmed">Confirmadas</option>
                        <option value="pending">Pendentes</option>
                      </select>
                    </label>
                  )}

                  <div className="space-y-1 text-sm text-gray-600">
                    <span>Horário</span>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="sr-only" htmlFor="time-start-filter">
                        De
                      </label>
                      <input
                        id="time-start-filter"
                        type="time"
                        value={timeStartFilter}
                        onChange={(event) =>
                          setTimeStartFilter(event.target.value)
                        }
                        aria-label="Horário inicial"
                        className="w-full rounded-lg border border-gray-200 bg-background px-3 py-2 text-sm text-gray-700 outline-none transition-colors hover:border-gray-300 focus:border-primary"
                      />

                      <label className="sr-only" htmlFor="time-end-filter">
                        Até
                      </label>
                      <input
                        id="time-end-filter"
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
        </>
        )}

        {/* Tab Content - Offered Rides */}
        {activeTab === "offered" && (
          <div className="space-y-4">
            {rides.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Navigation className="w-10 h-10 text-foreground" />
                  </div>
                  <h3 className="text-foreground font-semibold text-lg mb-2">
                    Nenhuma carona ativa
                  </h3>
                  <p className="text-secondary-foreground text-sm mb-6">
                    Você ainda não ofereceu nenhuma carona
                  </p>
                  <button
                    onClick={() => navigate("/offer-ride")}
                    className="px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    Oferecer carona
                  </button>
                </div>
              </div>
            ) : displayedOfferedRides.length === 0 ? (
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
              displayedOfferedRides.map((ride) => (
                  <div
                    key={ride.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openOfferedRideDetails(ride)}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openOfferedRideDetails(ride);
                      }
                    }}
                    className="bg-background rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-foreground font-semibold text-lg">
                            {formatDate(ride.date)}
                          </h3>
                          {ride.sameGenderOnly && (
                            <span className="px-2 py-0.5 bg-info text-info-foreground text-xs font-medium rounded-full">
                              Mesmo gênero
                            </span>
                          )}
                          {ride.status === "completed" && (
                            <span className="px-2 py-0.5  bg-success text-success-foreground  text-xs font-medium rounded-full">
                              Concluída
                            </span>
                          )}
                        </div>
                        {/* <p className="text-gray-600 text-sm">
                          {ride.routeName}
                        </p> */}
                      </div>

                      <div className="flex gap-2">
                        {ride.status !== "completed" && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedRide(ride);
                              setModalType("delete");
                            }}
                            className="p-2 hover:bg-destructive-muted rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5 text-destructive" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Route */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">{ride.origin}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          {ride.destination}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-muted-foreground">
                        {ride.departureTimeStart} - {ride.departureTimeEnd}
                      </span>
                    </div>
                    {/* Info Grid
                    <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {ride.departureTimeStart} - {ride.departureTimeEnd}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          R$ {ride.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {ride.availableSeats}/{ride.totalSeats} vagas
                          disponíveis
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {ride.confirmedPassengers.length} confirmado(s)
                        </span>
                      </div>
                    </div> */}

                    {/* Requests Badge */}
                    {ride.requests.length > 0 && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedRide(ride);
                          setModalType("requests");
                        }}
                        className="mt-2 w-full p-3 bg-warning border border-warning-border rounded-lg hover:bg-warning-hover transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-warning-foreground" />
                          <span className="text-sm font-medium text-warning-foreground">
                            {ride.requests.length} nova(s) solicitação(ões)
                          </span>
                        </div>
                        <span className="text-warning-foreground">→</span>
                      </button>
                    )}

                    {/* Confirmed Passengers - Collapsible */}
                    {ride.confirmedPassengers.length > 0 && (
                      <div className="mt-4">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleRideExpansion(ride.id);
                          }}
                          className="w-full flex items-center justify-between p-3 bg-success border border-success-border rounded-lg hover:bg-success-hover transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-success-foreground" />
                            <span className="text-sm font-medium text-success-foreground  ">
                              {ride.confirmedPassengers.length} passageiro(s)
                              confirmado(s)
                            </span>
                          </div>
                          {expandedRides.has(ride.id) ? (
                            <ChevronUp className="w-5 h-5 text-success-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-success-foreground" />
                          )}
                        </button>

                        {expandedRides.has(ride.id) && (
                          <div className="space-y-2 mt-3">
                            {ride.confirmedPassengers.map((passenger) => (
                              <div
                                key={passenger.id}
                                className="flex items-center justify-between p-3 bg-background border border-gray-200 rounded-lg"
                              >
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    navigate(`/user/${passenger.passenger.id}`);
                                  }}
                                  className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
                                >
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#1D3557] to-[#2d4a6f] rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary-foreground" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {passenger.passenger.name}
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                      <span className="text-xs text-gray-600">
                                        {passenger.passenger.rating}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                                {ride.status !== "completed" && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openChat(
                                          {
                                            id: passenger.passenger.id,
                                            name: passenger.passenger.name,
                                            rating: passenger.passenger.rating,
                                          },
                                          {
                                            date: ride.date,
                                            origin: ride.origin,
                                            destination: ride.destination,
                                          },
                                        );
                                      }}
                                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                      <MessageCircle className="w-4 h-4 text-blue-600" />
                                    </button>
                                    <button
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setSelectedRide(ride);
                                        setSelectedPassengerToRemove(passenger);
                                        setModalType("remove-passenger");
                                      }}
                                      className="p-2 hover:bg-destructive-muted rounded-lg transition-colors"
                                    >
                                      <X className="w-4 h-4 text-destructive" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Complete Ride Button */}
                    {ride.status === "active" &&
                      isRidePast(ride.date, ride.departureTimeEnd) &&
                      !ride.driverRatingsGiven && (
                        <div className="mt-4">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCompleteRide(ride);
                            }}
                            className="w-full p-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            Concluir carona
                          </button>
                        </div>
                      )}
                  </div>
                ))
            )}
          </div>
        )}

        {/* Tab Content - Received Rides */}
        {activeTab === "received" && (
          <div className="space-y-4">
            {ridesAsPassenger.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Navigation className="w-10 h-10 text-foreground" />
                  </div>
                  <h3 className="text-foreground font-semibold text-lg mb-2">
                    Nenhuma carona no momento
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Você ainda não está participando de nenhuma carona
                  </p>
                  <button
                    onClick={() => navigate("/find-ride")}
                    className="px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    Buscar carona
                  </button>
                </div>
              </div>
            ) : displayedReceivedRides.length === 0 ? (
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
              displayedReceivedRides.map((ride) => (
                <div
                  key={ride.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openReceivedRideDetails(ride)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openReceivedRideDetails(ride);
                    }
                  }}
                  className="bg-background rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-foreground font-semibold text-lg">
                          {formatDate(ride.date)}
                        </h3>
                        {ride.sameGenderOnly && (
                          <span className="px-2 py-0.5 bg-info text-info-foreground text-xs font-medium rounded-full">
                            Mesmo gênero
                          </span>
                        )}
                        {ride.status === "completed" && (
                          <span className="px-2 py-0.5  bg-success text-success-foreground  text-xs font-medium rounded-full">
                            Concluída
                          </span>
                        )}
                        {ride.status === "confirmed" && (
                          <span className="px-2 py-0.5  bg-success text-success-foreground  text-xs font-medium rounded-full">
                            Confirmada
                          </span>
                        )}
                        {ride.status === "pending" && (
                          <span className="px-2 py-0.5 bg-warning text-warning-foreground text-xs font-medium rounded-full">
                            Pendente
                          </span>
                        )}
                      </div>
                      {/* <p className="text-gray-600 text-sm">{ride.routeName}</p> */}
                    </div>

                    {(ride.status === "confirmed" ||
                      ride.status === "pending") && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedPassengerRide(ride);
                          setModalType("cancel-passenger");
                        }}
                        className="p-2 hover:bg-destructive-muted rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-destructive" />
                      </button>
                    )}
                  </div>

                  {/* Route */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{ride.origin}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                      <p className="text-sm text-gray-700">
                        {ride.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {ride.departureTimeStart} - {ride.departureTimeEnd}
                    </span>
                  </div>
                  {/* Info Grid
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {ride.departureTimeStart} - {ride.departureTimeEnd}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        R$ {ride.price.toFixed(2)}
                      </span>
                    </div>
                  </div> */}

                  {/* Driver Info
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Motorista
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/user/${ride.driver.id}`)}
                        className="flex-1 flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-[#1D3557] to-[#2d4a6f] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {ride.driver.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-gray-600">
                              {ride.driver.rating} ({ride.driver.totalRatings})
                            </span>
                          </div>
                        </div>
                      </button>
                      {ride.status === "confirmed" && (
                        <button
                          onClick={() =>
                            openChat(
                              {
                                id: ride.driver.id,
                                name: ride.driver.name,
                                rating: ride.driver.rating,
                              },
                              {
                                date: ride.date,
                                origin: ride.origin,
                                destination: ride.destination,
                              },
                            )
                          }
                          className="p-3 bg-primary hover:bg-[#2d4a6f] rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-5 h-5 text-primary-foreground" />
                        </button>
                      )}
                    </div>
                  </div> */}

                  {/* Complete Ride Button for Passenger */}
                  {ride.status === "confirmed" &&
                    isRidePast(ride.date, ride.departureTimeEnd) &&
                    !ride.passengerRatingGiven && (
                      <div className="mt-4">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCompletePassengerRide(ride);
                          }}
                          className="w-full p-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Concluir carona
                        </button>
                      </div>
                    )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {showRatingSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success-foreground" />
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sucesso!
            </h2>

            <p className="text-gray-600 mb-6">{ratingSuccessText}</p>

            <button
              onClick={() => setShowRatingSuccess(false)}
              className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
      {/* Modal de detalhes da carona */}
      {modalType === "details" && selectedDetailsRide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold">Detalhes da carona</h2>
              <button onClick={closeDetailsModal}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {formatDate(selectedDetailsRide.date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {selectedDetailsRide.departureTimeStart} -{" "}
                  {selectedDetailsRide.departureTimeEnd}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  R$ {selectedDetailsRide.price.toFixed(2)}
                </span>
              </div>
              {(selectedRide || selectedPassengerRide) && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {selectedDetailsOccupiedSeats}/
                    {selectedDetailsRide.totalSeats} ocupados
                  </span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Navigation className="w-5 h-5 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  {selectedDetailsRide.routeName}
                </h3>
              </div>

              <p className="text-xs text-secondary-foreground mb-3 font-medium">
                Pontos de passagem:
              </p>
              <div className="space-y-2">
                {[selectedDetailsRide.origin, selectedDetailsRide.destination].map(
                  (waypoint, index, waypoints) => (
                    <div key={waypoint} className="flex items-center gap-3">
                      {index === 0 ? (
                        <div className="w-3 h-3 bg-primary rounded-full" />
                      ) : index === waypoints.length - 1 ? (
                        <MapPin className="w-3 h-3 text-accent" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full ml-0.5" />
                      )}
                      <span className="text-sm text-gray-700">{waypoint}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {selectedPassengerRide && (
              <div className="mt-6 p-4 bg-primary/5 rounded-xl">
                <p className="text-xs text-secondary-foreground mb-2 font-medium">
                  Motorista
                </p>
                <button
                  onClick={() => navigate(`/user/${selectedPassengerRide.driver.id}`)}
                  className="w-full flex items-center gap-3 text-left hover:bg-primary/10 p-2 rounded-xl transition"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPassengerRide.driver.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-warning-foreground" />
                      <span className="text-sm font-medium text-gray-700">
                        {selectedPassengerRide.driver.rating}
                      </span>
                      <span className="text-xs text-secondary-foreground">
                        ({selectedPassengerRide.driver.totalRatings})
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {selectedRide && selectedRide.confirmedPassengers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setShowPassengers((current) => !current)}
                  className="w-full flex items-center justify-between p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
                >
                  <span className="text-sm font-semibold text-foreground">
                    Passageiros ({selectedRide.confirmedPassengers.length})
                  </span>
                  {showPassengers ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {showPassengers && (
                  <div className="space-y-2 mt-3">
                    {selectedRide.confirmedPassengers.map((passenger) => (
                      <button
                        key={passenger.id}
                        onClick={() =>
                          navigate(`/user/${passenger.passenger.id}`)
                        }
                        className="w-full flex items-center gap-3 p-3 bg-secondary rounded-xl hover:bg-gray-100 transition text-left"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {passenger.passenger.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-warning-foreground" />
                            <span className="text-xs text-gray-700 font-medium">
                              {passenger.passenger.rating}
                            </span>
                            <span className="text-xs text-gray-500">
                              • {passenger.passenger.gender}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedPassengerRide &&
              selectedPassengerRide.otherPassengers.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setShowPassengers((current) => !current)}
                    className="w-full flex items-center justify-between p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      Outros passageiros (
                      {selectedPassengerRide.otherPassengers.length})
                    </span>
                    {showPassengers ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  {showPassengers && (
                    <div className="space-y-2 mt-3">
                      {selectedPassengerRide.otherPassengers.map(
                        (passenger) => (
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
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      )}
      {/* Modal de remoção do passageiro */}
      {modalType === "remove-passenger" &&
        selectedRide &&
        selectedPassengerToRemove && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-background rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-warning-foreground" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Remover passageiro</h2>

                  <p className="text-sm text-foreground-muted">
                    Deseja realmente remover este passageiro?
                  </p>
                </div>
              </div>

              <div className="bg-secondary rounded-xl p-4 mb-6">
                <p className="font-medium">
                  {selectedPassengerToRemove.passenger.name}
                </p>

                <p className="text-sm text-secondary-foreground">
                  Será liberada 1 vaga novamente.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setModalType(null);
                    setSelectedPassengerToRemove(null);
                  }}
                  className="flex-1 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted-hover"
                >
                  Cancelar
                </button>

                <button
                  onClick={() =>
                    handleRemovePassenger(
                      selectedRide.id,
                      selectedPassengerToRemove.id,
                    )
                  }
                  className="flex-1 py-3 bg-destructive text-destructive-foreground hover:bg-destructive-hover rounded-lg"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        )}
      {/* Delete Modal */}
      {modalType === "delete" && selectedRide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h2 className="text-foreground font-semibold text-lg">
                  {selectedRide.confirmedPassengers.length === 0 &&
                  isRidePast(selectedRide.date, selectedRide.departureTimeEnd)
                    ? "Carona vazia"
                    : "Excluir carona"}
                </h2>

                <p className="text-gray-600 text-sm">
                  {selectedRide.confirmedPassengers.length === 0 &&
                  isRidePast(selectedRide.date, selectedRide.departureTimeEnd)
                    ? "Uma carona sem passageiros não pode ser concluída."
                    : "Esta ação não pode ser desfeita"}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {formatDate(selectedRide.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {selectedRide.departureTimeStart} -{" "}
                    {selectedRide.departureTimeEnd}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {selectedRide.origin} → {selectedRide.destination}
                  </span>
                </div>
              </div>
            </div>

            {selectedRide.confirmedPassengers.length > 0 && (
              <div className="mb-4 p-3 bg-warning border border-warning-border rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-warning-foreground flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    Há {selectedRide.confirmedPassengers.length} passageiro(s)
                    confirmado(s). Eles serão notificados sobre o cancelamento.
                  </p>
                </div>
              </div>
            )}

            {(() => {
              const hoursUntilRide = getHoursUntilRide(
                selectedRide.date,
                selectedRide.departureTimeStart,
              );
              return hoursUntilRide < 6 &&
                hoursUntilRide > 0 &&
                selectedRide.confirmedPassengers.length > 0 ? (
                <div className="mb-6 p-3 bg-destructive-muted border border-red-200 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-destructive mb-1">
                        Atenção: Penalidade aplicada!
                      </p>
                      <p className="text-sm text-red-700">
                        Ao deletar esta carona com menos de 6 horas de
                        antecedência, você perderá <strong>0.1 ponto</strong> na
                        sua avaliação.
                        {selectedRide.confirmedPassengers.length > 0 &&
                          " Os passageiros serão notificados sobre o cancelamento."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedRide(null);
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteRide(selectedRide.id)}
                className="flex-1 py-3 bg-destructive text-primary-foreground font-medium rounded-lg hover:bg-destructive-hover transition-colors"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Requests Modal */}
      {modalType === "requests" && selectedRide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground font-semibold text-lg">
                Solicitações ({selectedRide.requests.length})
              </h2>
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedRide(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {selectedRide.requests.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-success-foreground mx-auto mb-3" />
                <p className="text-gray-600">
                  Todas as solicitações foram processadas!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedRide.requests.map((request) => (
                  <div
                    key={request.id}
                    className={`
rounded-xl p-4 border transition-all duration-500
${
  processingRequest === request.id && requestAction === "accept"
    ? "border-green-300 bg-green-50 scale-95 opacity-80"
    : processingRequest === request.id && requestAction === "reject"
      ? "border-red-300 bg-red-50 scale-95 opacity-80"
      : "border-gray-200"
}
`}
                  >
                    <button
                      onClick={() => navigate(`/user/${request.passenger.id}`)}
                      className="flex items-start gap-3 mb-3 w-full text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-[#1D3557] to-[#2d4a6f] rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-foreground font-semibold">
                          {request.passenger.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium text-gray-700">
                              {request.passenger.rating}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({request.passenger.totalRatings})
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {request.passenger.gender}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{request.passenger.phone}</span>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                      Solicitado em{" "}
                      {new Date(request.requestedAt).toLocaleString("pt-BR")}
                    </p>

                    {selectedRide.availableSeats === 0 ? (
                      <div className="bg-destructive-muted border border-red-200 rounded-lg p-3">
                        <p className="text-xs text-red-700">
                          Não há mais vagas disponíveis
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleRejectRequest(selectedRide.id, request.id)
                          }
                          className="flex-1 py-2 px-4 bg-muted text-muted-foreground font-medium rounded-lg hover:bg-muted-hover transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Recusar
                        </button>
                        <button
                          onClick={() =>
                            handleAcceptRequest(selectedRide.id, request.id)
                          }
                          className="flex-1 py-2 px-4 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Aceitar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Chat Modal */}
      {chatOpen && chatUser && chatRideInfo && (
        <ChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          otherUser={chatUser}
          rideInfo={chatRideInfo}
        />
      )}
      {/* Cancel Passenger Ride Modal */}
      {modalType === "cancel-passenger" && selectedPassengerRide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h2 className="text-foreground font-semibold text-lg">
                  Desistir de carona
                </h2>
                <p className="text-gray-600 text-sm">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {formatDate(selectedPassengerRide.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {selectedPassengerRide.departureTimeStart} -{" "}
                    {selectedPassengerRide.departureTimeEnd}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {selectedPassengerRide.origin} →{" "}
                    {selectedPassengerRide.destination}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Motorista: {selectedPassengerRide.driver.name}
                  </span>
                </div>
              </div>
            </div>

            {(() => {
              const hoursUntilRide = getHoursUntilRide(
                selectedPassengerRide.date,
                selectedPassengerRide.departureTimeStart,
              );
              return hoursUntilRide < 6 && hoursUntilRide > 0 ? (
                <div className="mb-6 p-3 bg-destructive-muted border border-red-200 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-700 mb-1">
                        Atenção: Penalidade aplicada!
                      </p>
                      <p className="text-sm text-red-700">
                        Ao cancelar esta carona com menos de 6 horas de
                        antecedência, você perderá <strong>0.1 ponto</strong> na
                        sua avaliação. O motorista será notificado sobre o
                        cancelamento.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-3 bg-warning border border-warning-border rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-warning-foreground flex-shrink-0" />
                    <p className="text-sm text-yellow-700">
                      O motorista será notificado sobre o cancelamento.
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedPassengerRide(null);
                }}
                className="flex-1 py-3 bg-muted text-muted-foreground font-medium rounded-lg hover:bg-muted-hover transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() =>
                  handleCancelPassengerRide(selectedPassengerRide.id)
                }
                className="flex-1 py-3 bg-destructive text-primary-foreground font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Sim, desistir
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rating Modal */}
      {ratingModalOpen && currentRatingUser && chatRideInfo && (
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false);
            setModalType(null);
            setSelectedRide(null);
            setSelectedPassengerRide(null);
            setPassengersToRate([]);
            setCurrentPassengerIndex(0);
          }}
          onSubmit={handleSubmitRating}
          userName={currentRatingUser.name}
          userRating={currentRatingUser.rating}
          rideInfo={chatRideInfo}
          userType={currentRatingType}
        />
      )}
    </div>
  );
}
