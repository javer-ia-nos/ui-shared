import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export type TipoCuentaBeneficiario = "SAVINGS" | "CHECKING" | "AHORROS" | "CORRIENTE";
export type TipoDocumento = "CC" | "CE" | "NIT" | "PASAPORTE" | "TI";

export interface Beneficiario {
  id: string;
  userId: string;
  alias: string;
  bankName: string;
  accountNumber: string;
  accountType: TipoCuentaBeneficiario;
  documentType: TipoDocumento;
  documentNumber: string;
  createdAt?: string;
  isDeleted?: boolean;
}

export interface DatosBeneficiario {
  alias: string;
  bankName: string;
  accountNumber: string;
  accountType: TipoCuentaBeneficiario;
  documentType: TipoDocumento;
  documentNumber: string;
}

export interface UseBeneficiariosOptions {
  userId?: string;
  usuarioId?: string;
  apiBaseUrl?: string;
  token?: string;
}

/** CU-03: registro, consulta, edición y eliminación de beneficiarios contra ms-cuentas. */
export function useBeneficiarios({ userId, usuarioId, apiBaseUrl, token }: UseBeneficiariosOptions) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const baseUrl = apiBaseUrl ?? "/api/cuentas";
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!effectiveUserId) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/beneficiarios?userId=${effectiveUserId}`, {
        headers: encabezadosAuth(token),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || `No fue posible listar beneficiarios (${res.status})`);
      setBeneficiarios(body as Beneficiario[]);
    } catch (err: any) {
      setError(err.message || "Error inesperado consultando beneficiarios");
    } finally {
      setCargando(false);
    }
  }, [baseUrl, effectiveUserId, token]);

  const crear = useCallback(
    async (datos: DatosBeneficiario) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/beneficiarios`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ userId: effectiveUserId, ...datos }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible registrar el beneficiario (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado registrando el beneficiario");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, effectiveUserId, token, cargar],
  );

  const actualizar = useCallback(
    async (id: string, cambios: Partial<DatosBeneficiario>) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/beneficiarios/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify(cambios),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible actualizar el beneficiario (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado actualizando el beneficiario");
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
        const res = await fetch(`${baseUrl}/beneficiarios/${id}`, {
          method: "DELETE",
          headers: encabezadosAuth(token),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible eliminar el beneficiario (${res.status})`);
        await cargar();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado eliminando el beneficiario");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, cargar],
  );

  return { beneficiarios, cargando, error, cargar, crear, actualizar, eliminar };
}
