import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export type TipoOperacionPresencial = "CASH_DEPOSIT" | "CHECK_DEPOSIT" | "CASH_WITHDRAWAL";

export interface TransaccionFisicaResultado {
  id: string;
  numeroComprobante: string;
  tipoOperacion: string;
  cuentaId: string;
  monto: number;
  moneda: string;
  sucursalId: string;
  cajeroId: string;
  numeroCheque: string | null;
  bancoCheque: string | null;
  estado: string;
  fecha: string;
  mensaje: string;
}

export interface UsePagoPresencialOptions {
  cuentaId?: string;
  apiBaseUrl?: string;
  token?: string;
  onSuccess?: (resultado: TransaccionFisicaResultado) => void;
  onError?: (error: string) => void;
}

/** Hook headless para CU-28 (registro de depósitos/retiros en ventanilla), vía api-gateway. */
export function usePagoPresencial(options: UsePagoPresencialOptions = {}) {
  const [cuentaId, setCuentaId] = useState(options.cuentaId ?? "");
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacionPresencial>("CASH_DEPOSIT");
  const [monto, setMonto] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  const [cajeroId, setCajeroId] = useState("");
  const [numeroCheque, setNumeroCheque] = useState("");
  const [bancoCheque, setBancoCheque] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<TransaccionFisicaResultado | null>(null);

  const reset = useCallback(() => {
    setMonto("");
    setNumeroCheque("");
    setBancoCheque("");
    setDescripcion("");
    setError(null);
    setResultado(null);
  }, []);

  const registrar = useCallback(async () => {
    const valorNumerico = parseFloat(monto);
    if (!cuentaId || !sucursalId || !cajeroId) {
      const msg = "Cuenta, sucursal y cajero son requeridos";
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
    if (tipoOperacion === "CHECK_DEPOSIT" && !numeroCheque) {
      const msg = "El número de cheque es requerido para un depósito con cheque";
      setError(msg);
      options.onError?.(msg);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const baseUrl = options.apiBaseUrl ?? "/api/transacciones";
      const res = await fetch(`${baseUrl}/pagos-fisicos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...encabezadosAuth(options.token) },
        body: JSON.stringify({
          cuentaId,
          tipoOperacion,
          monto: valorNumerico,
          sucursalId,
          cajeroId,
          numeroCheque: numeroCheque || undefined,
          bancoCheque: bancoCheque || undefined,
          descripcion: descripcion || undefined,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || `Error registrando la operación presencial (${res.status})`);
      }

      setResultado(body as TransaccionFisicaResultado);
      options.onSuccess?.(body as TransaccionFisicaResultado);
      return body as TransaccionFisicaResultado;
    } catch (err: any) {
      const errorMsg = err.message || "Error inesperado registrando la operación presencial";
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setCargando(false);
    }
  }, [cuentaId, tipoOperacion, monto, sucursalId, cajeroId, numeroCheque, bancoCheque, descripcion, options]);

  return {
    cuentaId,
    setCuentaId,
    tipoOperacion,
    setTipoOperacion,
    monto,
    setMonto,
    sucursalId,
    setSucursalId,
    cajeroId,
    setCajeroId,
    numeroCheque,
    setNumeroCheque,
    bancoCheque,
    setBancoCheque,
    descripcion,
    setDescripcion,
    cargando,
    error,
    resultado,
    registrar,
    reset,
  };
}
