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

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;

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
          setError("Não foi possível calcular as rotas para este trajeto.");
          return;
        }

        renderersRef.current.forEach((r) => r.setMap(null));
        clickPolylinesRef.current.forEach((p) => p.setMap(null));
        visualPolylinesRef.current.forEach((p) => p.setMap(null));
        renderersRef.current = [];
        clickPolylinesRef.current = [];
        visualPolylinesRef.current = []; 

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
      renderersRef.current.forEach((r) => r.setMap(null));
      clickPolylinesRef.current.forEach((p) => p.setMap(null));
      visualPolylinesRef.current.forEach((p) => p.setMap(null)); 
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
        <div ref={mapRef} className="w-full h-full" />

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