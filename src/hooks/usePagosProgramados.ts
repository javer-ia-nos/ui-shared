import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export type FrecuenciaPago = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";

export interface PagoProgramado {
  id: string;
  cuentaOrigen: string;
  tipoTransaccion: string;
  monto: number;
  frecuencia: string;
  proximaEjecucion: string;
  activo: boolean;
  mensaje: string;
}

export interface UsePagosProgramadosOptions {
  cuentaOrigen?: string;
  apiBaseUrl?: string;
  token?: string;
}

/** Hook headless para CU-24 (pagos automáticos/programados), CRUD completo vía api-gateway. */
export function usePagosProgramados({ cuentaOrigen, apiBaseUrl, token }: UsePagosProgramadosOptions) {
  const baseUrl = apiBaseUrl ?? "/api/transacciones";
  const [pagos, setPagos] = useState<PagoProgramado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!cuentaOrigen) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/pagos-programados?cuentaOrigen=${encodeURIComponent(cuentaOrigen)}`, {
        headers: encabezadosAuth(token),
      });
      if (!res.ok) throw new Error(`No fue posible listar los pagos programados (${res.status})`);
      setPagos((await res.json()) as PagoProgramado[]);
    } catch (err: any) {
      setError(err.message || "Error inesperado consultando pagos programados");
    } finally {
      setCargando(false);
    }
  }, [cuentaOrigen, baseUrl, token]);

  const programar = useCallback(
    async (monto: number, frecuencia: FrecuenciaPago, proximaEjecucion: string, descripcion?: string) => {
      if (!cuentaOrigen) return;
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/pagos-programados`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ cuentaOrigen, monto, frecuencia, proximaEjecucion, descripcion }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible programar el pago (${res.status})`);
        await cargar();
        return body as PagoProgramado;
      } catch (err: any) {
        setError(err.message || "Error inesperado programando el pago");
      } finally {
        setCargando(false);
      }
    },
    [cuentaOrigen, baseUrl, token, cargar],
  );

  const alternarEstado = useCallback(
    async (id: string, activo: boolean) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/pagos-programados/${id}/toggle`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ activo }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible actualizar el pago programado (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado actualizando el pago programado");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar],
  );

  const cancelar = useCallback(
    async (id: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/pagos-programados/${id}`, {
          method: "DELETE",
          headers: encabezadosAuth(token),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible cancelar el pago programado (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado cancelando el pago programado");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar],
  );

  return { pagos, cargando, error, cargar, programar, alternarEstado, cancelar };
}
