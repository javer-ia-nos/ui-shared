import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export interface MovimientoCuenta {
  id: string;
  fecha: string;
  tipo: "CREDITO" | "DEBITO";
  monto: number;
  descripcion: string;
  referencia: string;
  saldoPosterior: number;
}

export interface ExtractoMensual {
  accountId: string;
  mes: number;
  anio: number;
  saldoInicial: number;
  totalCreditos: number;
  totalDebitos: number;
  saldoFinal: number;
  movimientos: MovimientoCuenta[];
}

export interface UseExtractoCuentaOptions {
  cuentaId?: string;
  accountId?: string;
  apiBaseUrl?: string;
  token?: string;
}

/** CU-11: historial de movimientos y extracto mensual de una cuenta, vía api-gateway. */
export function useExtractoCuenta({
  cuentaId,
  accountId,
  apiBaseUrl,
  token,
}: UseExtractoCuentaOptions) {
  const effectiveAccountId = cuentaId ?? accountId ?? "";
  const baseUrl = apiBaseUrl ?? "/api/financiero";
  const [movimientos, setMovimientos] = useState<MovimientoCuenta[]>([]);
  const [extracto, setExtracto] = useState<ExtractoMensual | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarMovimientos = useCallback(async () => {
    if (!effectiveAccountId) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(
        `${baseUrl}/financiero/movimientos/${effectiveAccountId}`,
        {
          headers: encabezadosAuth(token),
        },
      );
      const body = await res.json().catch(() => ({}));
      let list = (body?.movimientos ?? []) as MovimientoCuenta[];

      // Si ms-financiero no tiene registros contables directos, consultar el libro de transacciones
      if (list.length === 0) {
        const txRes = await fetch(
          `/api/transacciones/transactions?sourceAccountId=${effectiveAccountId}`,
          { headers: encabezadosAuth(token) },
        ).catch(() => null);

        if (txRes && txRes.ok) {
          const txs = await txRes.json().catch(() => []);
          if (Array.isArray(txs)) {
            list = txs.map((tx: any) => ({
              id: tx.id,
              fecha: tx.occurredAt || new Date().toISOString(),
              tipo:
                tx.operationType === "CASH_DEPOSIT" ||
                tx.operationType === "CHECK_DEPOSIT" ||
                tx.destinationAccountId === effectiveAccountId
                  ? "CREDITO"
                  : "DEBITO",
              monto: Number(tx.amount ?? 0),
              descripcion:
                tx.description ||
                tx.transactionTypeDescription ||
                "Transacción",
              referencia: `REF-${String(tx.id).slice(0, 8).toUpperCase()}`,
              saldoPosterior: 0,
            }));
          }
        }
      }

      setMovimientos(list);
    } catch (err: any) {
      setError(err.message || "Error inesperado consultando movimientos");
    } finally {
      setCargando(false);
    }
  }, [effectiveAccountId, baseUrl, token]);

  const cargarExtracto = useCallback(
    async (mes?: string | number, anio?: string | number) => {
      if (!effectiveAccountId) return;
      setCargando(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (mes !== undefined) params.set("mes", String(mes));
        if (anio !== undefined) params.set("anio", String(anio));
        const query = params.toString();
        const url = `${baseUrl}/financiero/extractos/${effectiveAccountId}${query ? `?${query}` : ""}`;
        const res = await fetch(url, { headers: encabezadosAuth(token) });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            body.message ||
              `No fue posible generar el extracto (${res.status})`,
          );
        }
        setExtracto(body as ExtractoMensual);
      } catch (err: any) {
        setError(err.message || "Error inesperado generando extracto");
      } finally {
        setCargando(false);
      }
    },
    [effectiveAccountId, baseUrl, token],
  );

  return {
    movimientos,
    extracto,
    cargando,
    error,
    cargarMovimientos,
    cargarExtracto,
  };
}
