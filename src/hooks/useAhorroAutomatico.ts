import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export type FrecuenciaAhorro = "DIARIA" | "SEMANAL" | "MENSUAL";

export interface ReglaAhorroAutomatico {
  id: string;
  accountId: string;
  subAccountId: string;
  savingsGoalId?: string | null;
  amount: number;
  frequency: FrecuenciaAhorro;
  nextRunDate: string;
  isActive: boolean;
  createdAt?: string;
}

export interface UseAhorroAutomaticoOptions {
  cuentaId?: string;
  apiBaseUrl?: string;
  token?: string;
}

/** Hook headless para CU-09 (ahorro automático), vía api-gateway contra ms-cuentas. */
export function useAhorroAutomatico({ cuentaId, apiBaseUrl, token }: UseAhorroAutomaticoOptions) {
  const baseUrl = apiBaseUrl ?? "/api/cuentas";
  const [reglas, setReglas] = useState<ReglaAhorroAutomatico[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!cuentaId) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/cuentas/ahorro-automatico/${cuentaId}`, {
        headers: encabezadosAuth(token),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || `No fue posible listar las reglas (${res.status})`);
      setReglas(body as ReglaAhorroAutomatico[]);
    } catch (err: any) {
      setError(err.message || "Error inesperado consultando reglas de ahorro automático");
    } finally {
      setCargando(false);
    }
  }, [cuentaId, baseUrl, token]);

  const crear = useCallback(
    async (datos: {
      subAccountId: string;
      amount: number;
      frequency: FrecuenciaAhorro;
      savingsGoalId?: string;
      startDate?: string;
    }) => {
      if (!cuentaId) return;
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/cuentas/ahorro-automatico`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ accountId: cuentaId, ...datos }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible crear la regla (${res.status})`);
        await cargar();
        return body as ReglaAhorroAutomatico;
      } catch (err: any) {
        setError(err.message || "Error inesperado creando la regla de ahorro automático");
      } finally {
        setCargando(false);
      }
    },
    [cuentaId, baseUrl, token, cargar],
  );

  const pausarReanudar = useCallback(
    async (id: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/cuentas/ahorro-automatico/${id}/pausar`, {
          method: "PATCH",
          headers: encabezadosAuth(token),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible pausar/reanudar la regla (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado pausando/reanudando la regla");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar],
  );

  const modificar = useCallback(
    async (id: string, cambios: { amount?: number; frequency?: FrecuenciaAhorro; isActive?: boolean }) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/cuentas/ahorro-automatico/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify(cambios),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible modificar la regla (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado modificando la regla");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar],
  );

  const eliminar = useCallback(
    async (id: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/cuentas/ahorro-automatico/${id}`, {
          method: "DELETE",
          headers: encabezadosAuth(token),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible eliminar la regla (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado eliminando la regla");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar],
  );

  return { reglas, cargando, error, cargar, crear, pausarReanudar, modificar, eliminar };
}
