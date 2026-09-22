import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export interface Subcuenta {
  id: string;
  parentAccountId: string;
  name: string;
  balance: number;
  createdAt: string;
}

export interface ResumenSubcuentas {
  parentAccountId: string;
  totalApartado: number;
  subcuentas: Subcuenta[];
}

export interface UseBolsillosOptions {
  cuentaId?: string;
  parentAccountId?: string;
  apiBaseUrl?: string;
  token?: string;
}

/** Hook headless para CU-08 (bolsillos/subcuentas), vía api-gateway contra ms-cuentas. */
export function useBolsillos({ cuentaId, parentAccountId, apiBaseUrl, token }: UseBolsillosOptions) {
  const effectiveCuentaId = cuentaId ?? parentAccountId ?? "";
  const baseUrl = apiBaseUrl ?? "/api/cuentas";
  const [subcuentas, setSubcuentas] = useState<Subcuenta[]>([]);
  const [totalApartado, setTotalApartado] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!effectiveCuentaId) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/cuentas/${effectiveCuentaId}/subcuentas`, {
        headers: encabezadosAuth(token),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || `No fue posible listar los bolsillos (${res.status})`);
      const resumen = body as ResumenSubcuentas;
      setSubcuentas(resumen.subcuentas ?? []);
      setTotalApartado(resumen.totalApartado ?? 0);
    } catch (err: any) {
      setError(err.message || "Error inesperado consultando bolsillos");
    } finally {
      setCargando(false);
    }
  }, [effectiveCuentaId, baseUrl, token]);

  const crear = useCallback(
    async (name: string, montoInicial?: number) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/subcuentas`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ parentAccountId: effectiveCuentaId, name, montoInicial }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible crear el bolsillo (${res.status})`);
        await cargar();
        return body as Subcuenta;
      } catch (err: any) {
        setError(err.message || "Error inesperado creando el bolsillo");
      } finally {
        setCargando(false);
      }
    },
    [effectiveCuentaId, baseUrl, token, cargar],
  );

  const renombrar = useCallback(
    async (id: string, name: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/subcuentas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ name }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible renombrar el bolsillo (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado renombrando el bolsillo");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar],
  );

  const separar = useCallback(
    async (id: string, monto: number) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/subcuentas/${id}/separar`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ monto }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible apartar el monto (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado apartando dinero en el bolsillo");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar],
  );

  const liberar = useCallback(
    async (id: string, monto: number) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/subcuentas/${id}/liberar`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ monto }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible liberar el monto (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado liberando dinero del bolsillo");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar],
  );

  const cerrar = useCallback(
    async (id: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/subcuentas/${id}`, {
          method: "DELETE",
          headers: encabezadosAuth(token),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible cerrar el bolsillo (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado cerrando el bolsillo");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar],
  );

  return { subcuentas, totalApartado, cargando, error, cargar, crear, renombrar, separar, liberar, cerrar };
}
