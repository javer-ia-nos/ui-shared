import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";
import type { PagoExternoResultado } from "./usePagoFactura";

export type OperadorMovil = "CLARO" | "MOVISTAR" | "TIGO" | "WOM";

export interface UseRecargaOptions {
  cuentaId?: string;
  apiBaseUrl?: string;
  token?: string;
  onSuccess?: (resultado: PagoExternoResultado) => void;
  onError?: (error: string) => void;
}

/** Hook headless para CU-27 (recargas a operadores móviles), vía api-gateway. */
export function useRecarga(options: UseRecargaOptions = {}) {
  const [cuentaId, setCuentaId] = useState(options.cuentaId ?? "");
  const [operador, setOperador] = useState<OperadorMovil>("CLARO");
  const [numeroCelular, setNumeroCelular] = useState("");
  const [monto, setMonto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<PagoExternoResultado | null>(null);

  const reset = useCallback(() => {
    setNumeroCelular("");
    setMonto("");
    setError(null);
    setResultado(null);
  }, []);

  const recargar = useCallback(async () => {
    const valorNumerico = parseFloat(monto);
    if (!cuentaId) {
      const msg = "La cuenta a debitar es requerida";
      setError(msg);
      options.onError?.(msg);
      return;
    }
    if (!/^[0-9]{10}$/.test(numeroCelular)) {
      const msg = "El número de celular debe tener 10 dígitos";
      setError(msg);
      options.onError?.(msg);
      return;
    }
    if (isNaN(valorNumerico) || valorNumerico < 1000 || valorNumerico > 500000) {
      const msg = "El monto de la recarga debe estar entre $1.000 y $500.000";
      setError(msg);
      options.onError?.(msg);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const baseUrl = options.apiBaseUrl ?? "/api/transacciones";
      const res = await fetch(`${baseUrl}/recargas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...encabezadosAuth(options.token) },
        body: JSON.stringify({ cuentaId, operador, numeroCelular, monto: valorNumerico }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || `Error procesando la recarga (${res.status})`);
      }

      setResultado(body as PagoExternoResultado);
      options.onSuccess?.(body as PagoExternoResultado);
      return body as PagoExternoResultado;
    } catch (err: any) {
      const errorMsg = err.message || "Error inesperado procesando la recarga";
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setCargando(false);
    }
  }, [cuentaId, operador, numeroCelular, monto, options]);

  return {
    cuentaId,
    setCuentaId,
    operador,
    setOperador,
    numeroCelular,
    setNumeroCelular,
    monto,
    setMonto,
    cargando,
    error,
    resultado,
    recargar,
    reset,
  };
}
