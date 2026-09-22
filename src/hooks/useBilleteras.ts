import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export interface BilleteraVinculada {
  id: string;
  usuarioId: string;
  tarjetaId: string;
  billetera: string;
  estado: string;
  fechaVinculacion: string;
  mensaje: string;
}

export interface UseBilleterasOptions {
  userId?: string;
  usuarioId?: string;
  apiBaseUrl?: string;
  token?: string;
}

/** Hook headless para CU-29 (billeteras externas: Apple Pay / Google Wallet), vía api-gateway → ms-transacciones. */
export function useBilleteras({ userId, usuarioId, apiBaseUrl, token }: UseBilleterasOptions) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const baseUrl = apiBaseUrl ?? "/api/transacciones";

  const [billeteras, setBilleteras] = useState<BilleteraVinculada[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!effectiveUserId) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/billeteras/vinculaciones?usuarioId=${effectiveUserId}`, {
        headers: encabezadosAuth(token),
      });
      if (!res.ok) throw new Error(`No fue posible listar las billeteras vinculadas (${res.status})`);
      setBilleteras((await res.json()) as BilleteraVinculada[]);
    } catch (err: any) {
      setError(err.message || "Error inesperado consultando billeteras vinculadas");
    } finally {
      setCargando(false);
    }
  }, [effectiveUserId, baseUrl, token]);

  const vincular = useCallback(
    async (tarjetaId: string, billetera: "APPLE_PAY" | "GOOGLE_WALLET", tokenDispositivo: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/billeteras/vinculaciones`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ usuarioId: effectiveUserId, tarjetaId, billetera, tokenDispositivo }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible vincular la billetera (${res.status})`);
        await cargar();
        return body as BilleteraVinculada;
      } catch (err: any) {
        setError(err.message || "Error inesperado vinculando la billetera");
      } finally {
        setCargando(false);
      }
    },
    [effectiveUserId, baseUrl, token, cargar],
  );

  const desvincular = useCallback(
    async (id: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/billeteras/vinculaciones/${id}`, {
          method: "DELETE",
          headers: encabezadosAuth(token),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible desvincular la billetera (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado desvinculando la billetera");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar],
  );

  return { billeteras, cargando, error, cargar, vincular, desvincular };
}
