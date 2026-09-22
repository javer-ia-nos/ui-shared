import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export type TipoCuenta = "AHORROS" | "CORRIENTE";
export type Moneda = "COP" | "USD";

export interface CotitularInput {
  userId: string;
  holderRole?: string;
}

export interface CuentaAbierta {
  id: string;
  userId: string;
  accountNumber: string;
  balance: number;
  currency: string;
  status: string;
  alias: string | null;
  accountType: string;
  titulares: { id: string; userId: string; holderRole: string; addedAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface UseAperturaCuentaOptions {
  apiBaseUrl?: string;
  token?: string;
  onSuccess?: (cuenta: CuentaAbierta) => void;
  onError?: (error: string) => void;
}

const SEGMENTO: Record<TipoCuenta, string> = {
  AHORROS: "ahorros",
  CORRIENTE: "corrientes",
};

/** CU-06 / CU-07: apertura de cuentas corrientes y de ahorros contra ms-cuentas. */
export function useAperturaCuenta(options: UseAperturaCuentaOptions = {}) {
  const baseUrl = options.apiBaseUrl ?? "/api/cuentas";
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cuentaCreada, setCuentaCreada] = useState<CuentaAbierta | null>(null);

  const aperturar = useCallback(
    async (
      tipoCuenta: TipoCuenta,
      userId: string,
      opciones: { depositoInicial?: number; moneda?: Moneda; alias?: string; cotitulares?: CotitularInput[] } = {},
    ): Promise<CuentaAbierta | undefined> => {
      if (!userId) {
        const msg = "El usuario titular es requerido";
        setError(msg);
        options.onError?.(msg);
        return;
      }

      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/cuentas/${SEGMENTO[tipoCuenta]}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(options.token) },
          body: JSON.stringify({ userId, ...opciones }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.message || `No fue posible abrir la cuenta (${res.status})`);
        }
        const cuenta = body as CuentaAbierta;
        setCuentaCreada(cuenta);
        options.onSuccess?.(cuenta);
        return cuenta;
      } catch (err: any) {
        const msg = err.message || "Error inesperado abriendo la cuenta";
        setError(msg);
        options.onError?.(msg);
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, options],
  );

  const consultarPorNumero = useCallback(
    async (tipoCuenta: TipoCuenta, numeroCuenta: string): Promise<CuentaAbierta | undefined> => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/cuentas/${SEGMENTO[tipoCuenta]}/numero/${numeroCuenta}`, {
          headers: encabezadosAuth(options.token),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.message || `No fue posible consultar la cuenta (${res.status})`);
        }
        return body as CuentaAbierta;
      } catch (err: any) {
        setError(err.message || "Error inesperado consultando la cuenta");
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, options.token],
  );

  const reset = useCallback(() => {
    setCuentaCreada(null);
    setError(null);
  }, []);

  return { cargando, error, cuentaCreada, aperturar, consultarPorNumero, reset };
}
