import { useState, useCallback } from "react";
import type { TransferenciaPayload } from "../types";

export interface UseTransferenciaOptions {
  apiBaseUrl?: string;
  onSuccess?: (resultado: any) => void;
  onError?: (error: string) => void;
}

/**
 * Hook headless para orquestar la lógica de transferencias.
 * Totalmente agnóstico a la UI (funciona en Web y en React Native).
 */
export function useTransferencia(options: UseTransferenciaOptions = {}) {
  const [cuentaOrigen, setCuentaOrigen] = useState<string>("");
  const [cuentaDestino, setCuentaDestino] = useState<string>("");
  const [monto, setMonto] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<boolean>(false);

  const reset = useCallback(() => {
    setMonto("");
    setDescripcion("");
    setError(null);
    setExito(false);
  }, []);

  const ejecutarTransferencia = useCallback(async () => {
    const valorNumerico = parseFloat(monto);
    if (!cuentaOrigen || !cuentaDestino) {
      const msg = "Las cuentas de origen y destino son requeridas";
      setError(msg);
      options.onError?.(msg);
      return;
    }

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      const msg = "El monto debe ser un número mayor a cero";
      setError(msg);
      options.onError?.(msg);
      return;
    }

    setCargando(true);
    setError(null);

    const payload: TransferenciaPayload = {
      cuentaOrigen,
      cuentaDestino,
      monto: valorNumerico,
      moneda: "COP",
      descripcion: descripcion || undefined,
    };

    try {
      const baseUrl = options.apiBaseUrl ?? "/api/transacciones";
      const res = await fetch(`${baseUrl}/transferencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Error en la transferencia (${res.status})`);
      }

      const data = await res.json();
      setExito(true);
      options.onSuccess?.(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || "Error inesperado procesando la transferencia";
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setCargando(false);
    }
  }, [cuentaOrigen, cuentaDestino, monto, descripcion, options]);

  return {
    cuentaOrigen,
    setCuentaOrigen,
    cuentaDestino,
    setCuentaDestino,
    monto,
    setMonto,
    descripcion,
    setDescripcion,
    cargando,
    error,
    exito,
    ejecutarTransferencia,
    reset,
  };
}
