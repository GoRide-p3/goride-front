import { useEffect, useRef, useState } from "react";
import { Navigation, MapPin } from "lucide-react";
import type { RouteOption } from "../types/route"; 

interface RouteMapProps {
  origin: string;
  destination: string;
  selectedRoute: string | null;
  onSelectRoute: (routeId: string) => void;
  onRoutesLoaded: (routes: RouteOption[]) => void;
}

const ROUTE_COLORS = ["#10B981", "#3B82F6", "#8B5CF6"];
const ROUTE_NAMES = ["Via Principal", "Rota Secundária", "Rota Alternativa"];

const shortPlaceName = (place: string) => place.split(",")[0].trim() || place;

const buildLocalRoutes = (origin: string, destination: string): RouteResult[] => {
  const start = shortPlaceName(origin);
  const end = shortPlaceName(destination);

  return [
    {
      id: "route-0",
      name: "Via Fernandes Lima",
      distance: "12,4 km",
      duration: "22 min",
      durationSeconds: 1320,
      distanceMeters: 12400,
      traffic: "moderate",
      isFastest: true,
      isShortest: false,
      description: "Rota direta passando pelas avenidas principais.",
      waypoints: [start, "Av. Fernandes Lima", "BR-104", end],
    },
    {
      id: "route-1",
      name: "Via Durval de Goes",
      distance: "10,9 km",
      duration: "25 min",
      durationSeconds: 1500,
      distanceMeters: 10900,
      traffic: "light",
      isFastest: false,
      isShortest: true,
      description: "Caminho um pouco mais curto, com ruas mais locais.",
      waypoints: [start, "Av. Durval de Goes", "Tabuleiro", end],
    },
    {
      id: "route-2",
      name: "Via Serraria",
      distance: "14,1 km",
      duration: "28 min",
      durationSeconds: 1680,
      distanceMeters: 14100,
      traffic: "moderate",
      isFastest: false,
      isShortest: false,
      description: "Alternativa para evitar trechos mais movimentados.",
      waypoints: [start, "Serraria", "Cidade Universitaria", end],
    },
  ];
};

export function RouteMap({
  origin,
  destination,
  selectedRoute,
  onSelectRoute,
  onRoutesLoaded,
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const renderersRef = useRef<google.maps.DirectionsRenderer[]>([]);
  const clickPolylinesRef = useRef<google.maps.Polyline[]>([]);
  const visualPolylinesRef = useRef<google.maps.Polyline[]>([]); 
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingLocalRoutes, setUsingLocalRoutes] = useState(false);

  useEffect(() => {
    const clearMapRoutes = () => {
      renderersRef.current.forEach((r) => r.setMap(null));
      clickPolylinesRef.current.forEach((p) => p.setMap(null));
      visualPolylinesRef.current.forEach((p) => p.setMap(null));
      renderersRef.current = [];
      clickPolylinesRef.current = [];
      visualPolylinesRef.current = [];
    };

    const showLocalRoutes = () => {
      const localRoutes = buildLocalRoutes(origin, destination);

      clearMapRoutes();
      setRoutes(localRoutes);
      onRoutesLoaded(localRoutes);
      onSelectRoute(localRoutes[0].id);
      setUsingLocalRoutes(true);
      setError(null);
      setLoading(false);
    };

    setLoading(true);
    setError(null);

    if (!mapRef.current || !window.google?.maps) {
      showLocalRoutes();
      return;
    }

    setUsingLocalRoutes(false);

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: -9.6498, lng: -35.7089 },
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });

    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        region: "br",
      },
      (result, status) => {
        setLoading(false);

        if (status !== "OK" || !result) {
          showLocalRoutes();
          return;
        }

        clearMapRoutes();

        const calculated: RouteOption[] = result.routes
          .slice(0, 3)
          .map((route, index) => {
            const leg = route.legs[0];
            const durationSeconds = leg.duration?.value ?? 0;
            const distanceMeters = leg.distance?.value ?? 0;
            const routeId = `route-${index}`;
            const path = route.overview_path;
            const polyline = route.overview_polyline;

            const renderer = new window.google.maps.DirectionsRenderer({
              map: mapInstanceRef.current,
              directions: result,
              routeIndex: index,
              suppressMarkers: index !== 0,
              suppressInfoWindows: true,
              suppressPolylines: true, 
            });
            renderersRef.current.push(renderer);

            const visualPolyline = new window.google.maps.Polyline({
              path,
              strokeColor: ROUTE_COLORS[index] ?? "#CBD5E1",
              strokeWeight: 5,
              strokeOpacity: 0.8,
              map: mapInstanceRef.current,
              zIndex: 2,
              clickable: false,
            });
            visualPolylinesRef.current.push(visualPolyline);

            const clickPolyline = new window.google.maps.Polyline({
              path,
              strokeColor: "transparent",
              strokeWeight: 20,
              strokeOpacity: 0,
              map: mapInstanceRef.current,
              zIndex: 10,
              clickable: true,
            });

            clickPolyline.addListener("click", () => {
              onSelectRoute(routeId);
            });

            clickPolyline.addListener("mouseover", () => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setOptions({ draggableCursor: "pointer" });
              }
            });
            clickPolyline.addListener("mouseout", () => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setOptions({ draggableCursor: "" });
              }
            });

            clickPolylinesRef.current.push(clickPolyline);

            const waypoints = (() => {
              const seen = new Set<string>();
              const points: string[] = [];

              for (const step of leg.steps) {

                const html = step.instructions;
                const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
                const streetMatch = text.match(
                  /\b(Av(?:enida)?\.?\s+[\w\s]+|R(?:ua)?\.?\s+[\w\s]+|Al(?:ameda)?\.?\s+[\w\s]+|Trav(?:essa)?\.?\s+[\w\s]+|Rod(?:ovia)?\.?\s+[\w\s]+|Estr(?:ada)?\.?\s+[\w\s]+)/i,
                );

                if (streetMatch) {
                  const name = streetMatch[1]
                    .replace(/\s+/g, " ")
                    .trim()
                    .split(/\s+/)
                    .slice(0, 4)
                    .join(" ");

                  if (name.length > 4 && !seen.has(name)) {
                    seen.add(name);
                    points.push(name);
                  }
                }

                if (points.length >= 4) break;
              }

              return points.length > 0
                ? points
                : [leg.start_address.split(",")[0], leg.end_address.split(",")[0]];
            })();

            return {
              id: routeId,
              name: ROUTE_NAMES[index] ?? `Rota ${index + 1}`,
              distance: leg.distance?.text ?? "",
              duration: leg.duration?.text ?? "",
              durationSeconds,
              distanceMeters,
              traffic:
                durationSeconds < 1200
                  ? "light"
                  : durationSeconds < 2400
                    ? "moderate"
                    : "heavy",
              isFastest: false,
              isShortest: false,
              description: route.summary ?? "",
              waypoints,
              polyline,
            };
          });

        if (calculated.length > 0) {
          const fastestIdx = calculated.reduce(
            (min, r, i) => (r.durationSeconds < calculated[min].durationSeconds ? i : min),
            0,
          );
          const shortestIdx = calculated.reduce(
            (min, r, i) => (r.distanceMeters < calculated[min].distanceMeters ? i : min),
            0,
          );
          calculated[fastestIdx].isFastest = true;
          calculated[shortestIdx].isShortest = true;
        }

        setRoutes(calculated);
        onRoutesLoaded(calculated);

        if (calculated.length > 0) {
          onSelectRoute(calculated[0].id);
        }
      },
    );

    return () => {
      clearMapRoutes();
    };
  }, [origin, destination]);

  useEffect(() => {
    visualPolylinesRef.current.forEach((polyline, index) => {
      const routeId = `route-${index}`;
      const isSelected = routeId === selectedRoute;

      polyline.setOptions({
      strokeColor: isSelected ? ROUTE_COLORS[index] : ROUTE_COLORS[index],
        strokeWeight: isSelected ? 8 : 5,
        strokeOpacity: isSelected ? 1 : 0.3,
        zIndex: isSelected ? 5 : 1,
      });
    });
  }, [selectedRoute]);

  return (
    <div className="bg-background rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="px-4 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4" />
          <span className="text-sm font-medium">Visualização das rotas</span>
        </div>
        <span className="text-xs opacity-75">Toque para selecionar</span>
      </div>

      <div className="relative aspect-[4/3]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <p className="text-sm text-gray-500">Calculando rotas...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10 p-4">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}
        {usingLocalRoutes ? (
          <div className="w-full h-full bg-[#EEF4F3] p-4">
            <div className="relative h-full overflow-hidden rounded-xl border border-white/80 bg-white/70">
              <div className="absolute left-5 top-5 max-w-[45%] rounded-lg bg-background px-3 py-2 shadow-sm">
                <p className="text-[11px] font-semibold text-gray-500">Origem</p>
                <p className="truncate text-xs font-medium text-foreground">
                  {shortPlaceName(origin)}
                </p>
              </div>

              <div className="absolute bottom-5 right-5 max-w-[45%] rounded-lg bg-background px-3 py-2 shadow-sm">
                <p className="text-[11px] font-semibold text-gray-500">Destino</p>
                <p className="truncate text-xs font-medium text-foreground">
                  {shortPlaceName(destination)}
                </p>
              </div>

              <div className="absolute inset-x-6 top-1/2 h-px bg-gray-300" />
              <div className="absolute left-7 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-primary shadow" />
              <div className="absolute right-7 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-accent shadow" />

              <div className="absolute inset-x-5 top-[32%] space-y-3">
                {routes.map((route, index) => (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => onSelectRoute(route.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border bg-background/95 px-3 py-2 text-left shadow-sm transition-all ${
                      selectedRoute === route.id
                        ? "border-primary"
                        : "border-transparent hover:border-gray-200"
                    }`}
                  >
                    <span
                      className="h-2 w-14 rounded-full"
                      style={{ backgroundColor: ROUTE_COLORS[index] }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-foreground">
                        {route.name}
                      </span>
                      <span className="block text-[11px] text-gray-500">
                        {route.duration} • {route.distance}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div ref={mapRef} className="w-full h-full" />
        )}

        <div className="absolute bottom-3 left-3 bg-background/95 backdrop-blur-sm rounded-lg shadow-md p-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-gray-700 font-medium">Origem</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-3 h-3 text-accent" />
            <span className="text-gray-700 font-medium">Destino</span>
          </div>
        </div>

        {routes.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-background/95 backdrop-blur-sm rounded-lg shadow-md p-3 space-y-1.5">
            {routes.map((route, index) => (
              <button
                key={route.id}
                onClick={() => onSelectRoute(route.id)}
                className={`flex items-center gap-2 text-xs transition-all hover:bg-gray-50 px-2 py-1 rounded ${
                  selectedRoute === route.id ? "bg-gray-50" : ""
                }`}
              >
                <div
                  className="w-4 h-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor:
                      selectedRoute === route.id ? ROUTE_COLORS[index] : "#CBD5E1",
                  }}
                />
                <span
                  className={
                    selectedRoute === route.id
                      ? "font-semibold text-gray-700"
                      : "text-gray-500"
                  }
                >
                  Rota {index + 1}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedRoute && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Rota selecionada:</span>
            <span className="text-foreground font-semibold">
              {routes.find((r) => r.id === selectedRoute)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
