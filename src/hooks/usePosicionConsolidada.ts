import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export interface CuentaPosicion {
  id: string;
  tipo: string;
  numeroCuenta: string;
  saldo: number;
  estado: string;
}

export interface TarjetaPosicion {
  id: string;
  franquicia: string;
  ultimosDigitos: string;
  cupoTotal: number;
  cupoDisponible: number;
  saldoPendiente: number;
}

export interface InversionPosicion {
  id: string;
  tipo: string;
  monto: number;
  tasaEA: number;
  fechaVencimiento: string;
  estado: string;
}

export interface PrestamoPosicion {
  id: string;
  montoSolicitado: number;
  saldoPendiente: number;
  cuotaMensual: number;
  estado: string;
}

export interface PosicionConsolidada {
  userId: string;
  resumen: {
    totalActivos: number;
    totalPasivos: number;
    patrimonioNeto: number;
    saldoDisponibleGlobal: number;
  };
  productos: {
    cuentas: CuentaPosicion[];
    tarjetas: TarjetaPosicion[];
    inversiones: InversionPosicion[];
    prestamos: PrestamoPosicion[];
  };
}

export interface UsePosicionConsolidadaOptions {
  userId?: string;
  usuarioId?: string;
  apiBaseUrl?: string;
  token?: string;
}

/** CU-11: dashboard financiero (activos/pasivos/patrimonio + productos), vía api-gateway. */
export function usePosicionConsolidada({
  userId,
  usuarioId,
  apiBaseUrl,
  token,
}: UsePosicionConsolidadaOptions) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const baseUrl = apiBaseUrl ?? "/api/financiero";
  const [posicion, setPosicion] = useState<PosicionConsolidada | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!effectiveUserId) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/financiero/posicion-consolidada/${effectiveUserId}`, {
        headers: encabezadosAuth(token),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || `No fue posible consultar la posición consolidada (${res.status})`);
      }
      setPosicion(body as PosicionConsolidada);
    } catch (err: any) {
      setError(err.message || "Error inesperado consultando la posición consolidada");
    } finally {
      setCargando(false);
    }
  }, [effectiveUserId, baseUrl, token]);

  return { posicion, cargando, error, cargar };
}
