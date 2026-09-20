import { useState, useCallback } from "react";
import type { Dispositivo } from "../types";
import { encabezadosAuth } from "../utils";

export interface UseDispositivosOptions {
  usuarioId: string;
  apiBaseUrl?: string;
  token?: string;
}

/**
 * Hook headless para CU-17 (dispositivos confiables): registro, consulta y
 * revocación contra ms-seguridad, vía api-gateway (requiere sesión).
 */
export function useDispositivos({ usuarioId, apiBaseUrl, token }: UseDispositivosOptions) {
  const baseUrl = apiBaseUrl ?? "/api/seguridad";
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!usuarioId) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/dispositivos/${usuarioId}`, {
        headers: encabezadosAuth(token),
      });
      if (!res.ok) throw new Error(`No fue posible listar los dispositivos (${res.status})`);
      setDispositivos((await res.json()) as Dispositivo[]);
    } catch (err: any) {
      setError(err.message || "Error inesperado consultando dispositivos");
    } finally {
      setCargando(false);
    }
  }, [usuarioId, baseUrl, token]);

  const registrar = useCallback(
    async (fingerprint: string, nombre?: string, plataforma?: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/dispositivos`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ usuarioId, fingerprint, nombre, plataforma }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `No fue posible registrar el dispositivo (${res.status})`);
        await cargar();
        return body as Dispositivo;
      } catch (err: any) {
        setError(err.message || "Error inesperado registrando el dispositivo");
      } finally {
        setCargando(false);
      }
    },
    [usuarioId, baseUrl, token, cargar]
  );

  const revocar = useCallback(
    async (id: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/dispositivos/${id}`, {
          method: "DELETE",
          headers: encabezadosAuth(token),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `No fue posible revocar el dispositivo (${res.status})`);
        await cargar();
      } catch (err: any) {
        setError(err.message || "Error inesperado revocando el dispositivo");
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar]
  );

  return { dispositivos, cargando, error, cargar, registrar, revocar };
}
