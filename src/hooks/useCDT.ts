import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

/** Respuesta de ms-financiero para CDTs e inversiones (`ProductoResponseSchema`). */
export interface ProductoFinanciero {
  id: string;
  tipo: string;
  usuarioId: string;
  cuentaOrigen: string;
  monto: number;
  tasaEA: number;
  fechaVencimiento: string;
  estado: string;
  mensaje: string;
}

export interface UseCDTOptions {
  usuarioId?: string;
  userId?: string;
  apiBaseUrl?: string;
  token?: string;
  onSuccess?: (resultado: ProductoFinanciero) => void;
  onError?: (error: string) => void;
}

/** CU-12: apertura de CDT contra ms-financiero, vía api-gateway. */
export function useCDT(options: UseCDTOptions = {}) {
  const effectiveUsuarioId = options.usuarioId ?? options.userId ?? "";
  const baseUrl = options.apiBaseUrl ?? "/api/financiero";
  const [cuentaOrigen, setCuentaOrigen] = useState("");
  const [monto, setMonto] = useState("");
  const [plazoDias, setPlazoDias] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ProductoFinanciero | null>(null);

  const reset = useCallback(() => {
    setMonto("");
    setPlazoDias("");
    setError(null);
    setResultado(null);
  }, []);

  const abrirCDT = useCallback(async () => {
    const valorMonto = parseFloat(monto);
    const valorPlazo = parseInt(plazoDias, 10);

    if (!cuentaOrigen) {
      const msg = "La cuenta de origen es requerida";
      setError(msg);
      options.onError?.(msg);
      return;
    }
    if (isNaN(valorMonto) || valorMonto <= 0) {
      const msg = "El monto debe ser un número mayor a cero";
      setError(msg);
      options.onError?.(msg);
      return;
    }
    if (isNaN(valorPlazo) || valorPlazo < 30 || valorPlazo > 1825) {
      const msg = "El plazo debe estar entre 30 y 1825 días";
      setError(msg);
      options.onError?.(msg);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const res = await fetch(`${baseUrl}/cdt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...encabezadosAuth(options.token) },
        body: JSON.stringify({
          usuarioId: effectiveUsuarioId,
          cuentaOrigen,
          monto: valorMonto,
          plazoDias: valorPlazo,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || `No fue posible abrir el CDT (${res.status})`);

      const data = body as ProductoFinanciero;
      setResultado(data);
      options.onSuccess?.(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || "Error inesperado abriendo el CDT";
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setCargando(false);
    }
  }, [effectiveUsuarioId, cuentaOrigen, monto, plazoDias, baseUrl, options]);

  return {
    cuentaOrigen,
    setCuentaOrigen,
    monto,
    setMonto,
    plazoDias,
    setPlazoDias,
    cargando,
    error,
    resultado,
    abrirCDT,
    reset,
  };
}
