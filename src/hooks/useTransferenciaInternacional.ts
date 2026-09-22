import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export interface TransferenciaIntlPayload {
  cuentaOrigen: string;
  cuentaDestino: string;
  bancoDestino: string;
  monto: number;
  moneda?: string;
  isInternational: boolean;
  codigoSwift?: string;
  descripcion?: string;
}

export interface TransferenciaIntlResultado {
  id: string;
  numeroComprobante: string;
  tipo: string;
  monto: number;
  moneda: string;
  cuentaOrigen: string;
  cuentaDestino: string;
  bancoDestino: string;
  isInternational: boolean;
  referenciaLiquidacion: string;
  estado: string;
  fecha: string;
  mensaje: string;
}

export interface UseTransferenciaInternacionalOptions {
  apiBaseUrl?: string;
  token?: string;
  onSuccess?: (resultado: TransferenciaIntlResultado) => void;
  onError?: (error: string) => void;
}

/**
 * Hook headless para CU-26 (transferencias internacionales e interbancarias),
 * vía api-gateway -> ms-transacciones. Totalmente agnóstico a la UI.
 */
export function useTransferenciaInternacional(options: UseTransferenciaInternacionalOptions = {}) {
  const [cuentaOrigen, setCuentaOrigen] = useState("");
  const [cuentaDestino, setCuentaDestino] = useState("");
  const [bancoDestino, setBancoDestino] = useState("");
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState("USD");
  const [isInternational, setIsInternational] = useState(true);
  const [codigoSwift, setCodigoSwift] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<TransferenciaIntlResultado | null>(null);

  const reset = useCallback(() => {
    setMonto("");
    setDescripcion("");
    setCodigoSwift("");
    setError(null);
    setResultado(null);
  }, []);

  const ejecutar = useCallback(async () => {
    const valorNumerico = parseFloat(monto);
    if (!cuentaOrigen || !cuentaDestino || !bancoDestino) {
      const msg = "Cuenta origen, cuenta destino y banco destino son requeridos";
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

    const payload: TransferenciaIntlPayload = {
      cuentaOrigen,
      cuentaDestino,
      bancoDestino,
      monto: valorNumerico,
      moneda: moneda || undefined,
      isInternational,
      codigoSwift: codigoSwift || undefined,
      descripcion: descripcion || undefined,
    };

    try {
      const baseUrl = options.apiBaseUrl ?? "/api/transacciones";
      const res = await fetch(`${baseUrl}/transferencias-intl`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...encabezadosAuth(options.token) },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || `Error en la transferencia (${res.status})`);
      }

      setResultado(body as TransferenciaIntlResultado);
      options.onSuccess?.(body as TransferenciaIntlResultado);
      return body as TransferenciaIntlResultado;
    } catch (err: any) {
      const errorMsg = err.message || "Error inesperado procesando la transferencia";
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setCargando(false);
    }
  }, [cuentaOrigen, cuentaDestino, bancoDestino, monto, moneda, isInternational, codigoSwift, descripcion, options]);

  return {
    cuentaOrigen,
    setCuentaOrigen,
    cuentaDestino,
    setCuentaDestino,
    bancoDestino,
    setBancoDestino,
    monto,
    setMonto,
    moneda,
    setMoneda,
    isInternational,
    setIsInternational,
    codigoSwift,
    setCodigoSwift,
    descripcion,
    setDescripcion,
    cargando,
    error,
    resultado,
    ejecutar,
    reset,
  };
}
