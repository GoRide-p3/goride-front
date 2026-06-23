import { CheckCircle2, Clock, MapPin, AlertCircle, Calendar } from "lucide-react";
import { formatLocalDate } from "../utils/date";

interface RideAcceptedData {
  requestId: string;
  driverName: string;
  origin: string;
  destination: string;
  date: string;
  departureTimeStart: string;
  boardingAddress: string | null;
  boardingTime: string | null;
}

interface RideAcceptedModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RideAcceptedData;
}

export function RideAcceptedModal({ isOpen, onClose, data }: RideAcceptedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-background rounded-2xl p-6 max-w-md w-full">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-success-foreground" />
          </div>
          <h2 className="text-foreground font-semibold text-xl">
            Carona Confirmada! 🚗
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {data.driverName} aceitou sua solicitação
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {formatLocalDate(data.date, { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              Saída da origem: {data.departureTimeStart}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {data.origin} → {data.destination}
            </span>
          </div>

          {data.boardingTime && (
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Horário estimado de embarque</p>
                  <p className="text-base font-semibold text-accent">
                    {data.boardingTime}
                  </p>
                </div>
              </div>
              {data.boardingAddress && (
                <div className="flex items-start gap-2 mt-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">{data.boardingAddress}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Por ser uma carona, o motorista não poderá aguardar no local para
              não atrasar o trajeto. Certifique-se de estar no ponto com
              <strong> 5 minutos de antecedência</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-accent text-accent-foreground font-medium text-sm rounded-lg hover:bg-accent-hover transition-colors"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}