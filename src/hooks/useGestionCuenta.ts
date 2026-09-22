import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";
import type { TipoCuenta, CuentaAbierta } from "./useAperturaCuenta";

export type EstadoCuenta = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface UseGestionCuentaOptions {
  cuentaId?: string;
  tipoCuenta: TipoCuenta;
  apiBaseUrl?: string;
  token?: string;
}

const SEGMENTO: Record<TipoCuenta, string> = {
  AHORROS: "ahorros",
  CORRIENTE: "corrientes",
};

/** CU-06 / CU-07: modificación, cotitulares y cierre de una cuenta existente en ms-cuentas. */
export function useGestionCuenta({ cuentaId, tipoCuenta, apiBaseUrl, token }: UseGestionCuentaOptions) {
  const baseUrl = apiBaseUrl ?? "/api/cuentas";
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cuenta, setCuenta] = useState<CuentaAbierta | null>(null);

  const consultar = useCallback(async () => {
    if (!cuentaId) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/${SEGMENTO[tipoCuenta]}/${cuentaId}`, {
        headers: encabezadosAuth(token),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || `No fue posible consultar la cuenta (${res.status})`);
      setCuenta(body as CuentaAbierta);
    } catch (err: any) {
      setError(err.message || "Error inesperado consultando la cuenta");
    } finally {
      setCargando(false);
    }
  }, [baseUrl, cuentaId, tipoCuenta, token]);

  const modificar = useCallback(
    async (cambios: { alias?: string; status?: EstadoCuenta }) => {
      if (!cuentaId) return false;
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/${SEGMENTO[tipoCuenta]}/${cuentaId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify(cambios),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible modificar la cuenta (${res.status})`);
        setCuenta(body as CuentaAbierta);
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado modificando la cuenta");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, cuentaId, tipoCuenta, token],
  );

  const agregarCotitular = useCallback(
    async (userId: string, holderRole: string = "COTITULAR") => {
      if (!cuentaId) return false;
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/${SEGMENTO[tipoCuenta]}/${cuentaId}/titulares`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ userId, holderRole }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible agregar el cotitular (${res.status})`);
        setCuenta(body as CuentaAbierta);
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado agregando el cotitular");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, cuentaId, tipoCuenta, token],
  );

  const cerrar = useCallback(async () => {
    if (!cuentaId) return false;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/${SEGMENTO[tipoCuenta]}/${cuentaId}`, {
        method: "DELETE",
        headers: encabezadosAuth(token),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || `No fue posible cerrar la cuenta (${res.status})`);
      return true;
    } catch (err: any) {
      setError(err.message || "Error inesperado cerrando la cuenta");
      return false;
    } finally {
      setCargando(false);
    }
  }, [baseUrl, cuentaId, tipoCuenta, token]);

  return { cuenta, cargando, error, consultar, modificar, agregarCotitular, cerrar };
}
