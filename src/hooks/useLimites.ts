import { useState, useCallback } from "react";
import type { LimitesTransaccion } from "../types";
import { encabezadosAuth } from "../utils";

export interface UseLimitesOptions {
  usuarioId: string;
  apiBaseUrl?: string;
  token?: string;
}

/** Hook headless para CU-19 (topes/límites diarios y por operación), vía api-gateway. */
export function useLimites({ usuarioId, apiBaseUrl, token }: UseLimitesOptions) {
  const baseUrl = apiBaseUrl ?? "/api/seguridad";
  const [limites, setLimites] = useState<LimitesTransaccion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!usuarioId) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/limites/${usuarioId}`, {
        headers: encabezadosAuth(token),
      });
      if (res.status === 404) {
        setLimites(null);
        return;
      }
      if (!res.ok) throw new Error(`No fue posible consultar los límites (${res.status})`);
      setLimites((await res.json()) as LimitesTransaccion);
    } catch (err: any) {
      setError(err.message || "Error inesperado consultando límites");
    } finally {
      setCargando(false);
    }
  }, [usuarioId, baseUrl, token]);

  const actualizar = useCallback(
    async (limiteDiario: number, limitePorOperacion: number) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/limites/${usuarioId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ limiteDiario, limitePorOperacion }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `No fue posible actualizar los límites (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado actualizando límites");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [usuarioId, baseUrl, token, cargar]
  );

  return { limites, cargando, error, cargar, actualizar };
}
