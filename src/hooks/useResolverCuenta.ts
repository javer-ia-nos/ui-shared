import { useCallback, useState } from "react";
import { encabezadosAuth } from "../utils";

export interface CuentaResuelta {
  id: string;
  accountNumber: string;
  balance: number;
  currency: string;
  status: string;
  alias: string | null;
  accountType: string;
}

export interface UseResolverCuentaOptions {
  apiBaseUrl?: string;
  token?: string;
}

/**
 * Resuelve un número de cuenta (lo único que un usuario real conoce y debería
 * teclear) al UUID interno que esperan los demás endpoints de ms-cuentas.
 * Prueba primero contra /cuentas/ahorros/numero/:n y si no existe contra
 * /cuentas/corrientes/numero/:n — el usuario nunca necesita saber el tipo.
 */
export function useResolverCuenta({ apiBaseUrl, token }: UseResolverCuentaOptions = {}) {
  const baseUrl = apiBaseUrl ?? "/api/cuentas";
  const [resolviendo, setResolviendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cuenta, setCuenta] = useState<CuentaResuelta | null>(null);

  const resolver = useCallback(
    async (numeroCuenta: string): Promise<CuentaResuelta | undefined> => {
      // Tolera pegar el texto tal como se muestra en la UI ("No. CC-123..."),
      // en vez de exigir que el usuario borre el prefijo a mano.
      const numero = numeroCuenta.trim().replace(/^no\.?\s*/i, "");
      if (!numero) {
        setError("Escribe un número de cuenta");
        return;
      }
      setResolviendo(true);
      setError(null);
      setCuenta(null);
      try {
        for (const tipo of ["ahorros", "corrientes"] as const) {
          const res = await fetch(`${baseUrl}/cuentas/${tipo}/numero/${encodeURIComponent(numero)}`, {
            headers: encabezadosAuth(token),
          });
          if (res.ok) {
            const encontrada = (await res.json()) as CuentaResuelta;
            setCuenta(encontrada);
            return encontrada;
          }
        }
        setError("No se encontró ninguna cuenta con ese número");
      } catch (err: any) {
        setError(err.message || "Error inesperado buscando la cuenta");
      } finally {
        setResolviendo(false);
      }
    },
    [baseUrl, token],
  );

  const limpiar = useCallback(() => {
    setCuenta(null);
    setError(null);
  }, []);

  return { cuenta, resolviendo, error, resolver, limpiar };
}
