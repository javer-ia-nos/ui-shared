import { useState, useCallback } from "react";
import type { Dispositivo } from "../types";
import { encabezadosAuth } from "../utils";

export interface UseDispositivosOptions {
  userId?: string;
  usuarioId?: string;
  apiBaseUrl?: string;
  token?: string;
}

/**
 * Hook headless para CU-17 (dispositivos confiables): registro, consulta y
 * revocación contra ms-seguridad, vía api-gateway (requiere sesión).
 */
export function useDispositivos({
  userId,
  usuarioId,
  apiBaseUrl,
  token,
}: UseDispositivosOptions) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const baseUrl = apiBaseUrl ?? "/api/seguridad";
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!effectiveUserId) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/dispositivos/${effectiveUserId}`, {
        headers: encabezadosAuth(token),
      });
      if (!res.ok)
        throw new Error(
          `No fue posible listar los dispositivos (${res.status})`,
        );
      setDispositivos((await res.json()) as Dispositivo[]);
    } catch (err: any) {
      setError(err.message || "Error inesperado consultando dispositivos");
    } finally {
      setCargando(false);
    }
  }, [effectiveUserId, baseUrl, token]);

  const registrar = useCallback(
    async (fingerprint: string, nombre?: string, plataforma?: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/dispositivos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...encabezadosAuth(token),
          },
          body: JSON.stringify({
            usuarioId: effectiveUserId,
            fingerprint,
            nombre,
            plataforma,
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(
            body.error ||
              `No fue posible registrar el dispositivo (${res.status})`,
          );
        await cargar();
        return body as Dispositivo;
      } catch (err: any) {
        setError(err.message || "Error inesperado registrando el dispositivo");
      } finally {
        setCargando(false);
      }
    },
    [effectiveUserId, baseUrl, token, cargar],
  );

  const marcarConfiable = useCallback(
    async (id: string, confiable: boolean = true) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/dispositivos/${id}/confianza`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...encabezadosAuth(token),
          },
          body: JSON.stringify({ confiable }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(
            body.error ||
              `No fue posible actualizar la confianza (${res.status})`,
          );
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado actualizando la confianza");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar],
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
        if (!res.ok)
          throw new Error(
            body.error ||
              `No fue posible revocar el dispositivo (${res.status})`,
          );
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado revocando el dispositivo");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar],
  );

  return {
    dispositivos,
    cargando,
    error,
    cargar,
    registrar,
    marcarConfiable,
    revocar,
  };
}
