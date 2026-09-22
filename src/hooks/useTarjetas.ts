import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export type TipoTarjeta = "CREDITO" | "DEBITO";
export type EstadoTarjeta = "ACTIVA" | "BLOQUEADA";

export interface Tarjeta {
  id: string;
  userId: string;
  cardProduct: string;
  cardNumber: string;
  cardType: TipoTarjeta;
  status: EstadoTarjeta;
  creditLimit: number;
  isBlocked: boolean;
  createdAt: string;
}

export interface CupoTarjeta {
  tarjetaId: string;
  cupoTotal: number;
  cupoUsado: number;
  cupoDisponible: number;
}

export interface MovimientoTarjeta {
  id: string;
  cardId: string;
  amount: number;
  installments: number;
  createdAt: string;
  tipo: string;
}

export interface ExtractoTarjeta {
  tarjetaId: string;
  cardNumber: string;
  cardType: TipoTarjeta;
  status: EstadoTarjeta;
  totalMovimientos: number;
  movimientos: MovimientoTarjeta[];
}

export interface UseTarjetasOptions {
  userId?: string;
  usuarioId?: string;
  apiBaseUrl?: string;
  token?: string;
}

/**
 * Hook headless para ms-tarjetas (vía api-gateway /api/tarjetas). ms-tarjetas
 * no expone "listar tarjetas de un usuario", así que este hook solo puede
 * operar sobre tarjetas cuyo UUID el usuario ya conoce (las que él mismo
 * emite en la sesión, o pega a mano) — mismo patrón que useBilleteras/
 * GestionBilleteras con el tarjetaId. Sin datos ficticios: CVV dinámico y
 * límites por canal no existen en el backend real, así que este hook no los
 * expone.
 */
export function useTarjetas({ userId, usuarioId, apiBaseUrl, token }: UseTarjetasOptions) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const baseUrl = apiBaseUrl ?? "/api/tarjetas";
  const [tarjetasConocidas, setTarjetasConocidas] = useState<Tarjeta[]>([]);
  const [cupo, setCupo] = useState<CupoTarjeta | null>(null);
  const [extracto, setExtracto] = useState<ExtractoTarjeta | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordarTarjeta = useCallback((tarjeta: Tarjeta) => {
    setTarjetasConocidas((previas) => [tarjeta, ...previas.filter((t) => t.id !== tarjeta.id)]);
  }, []);

  const emitir = useCallback(
    async (cardProduct: string, cardType: TipoTarjeta, creditLimit?: number) => {
      if (!effectiveUserId) return null;
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/tarjetas/emitir`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ userId: effectiveUserId, cardProduct, cardType, creditLimit }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible emitir la tarjeta (${res.status})`);
        recordarTarjeta(body as Tarjeta);
        return body as Tarjeta;
      } catch (err: any) {
        setError(err.message || "Error inesperado emitiendo la tarjeta");
        return null;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, effectiveUserId, token, recordarTarjeta],
  );

  const consultarCupo = useCallback(
    async (tarjetaId: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/tarjetas/${tarjetaId}/cupo`, {
          headers: encabezadosAuth(token),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible consultar el cupo (${res.status})`);
        setCupo(body as CupoTarjeta);
        return body as CupoTarjeta;
      } catch (err: any) {
        setError(err.message || "Error inesperado consultando el cupo");
        return null;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token],
  );

  const consultarExtracto = useCallback(
    async (tarjetaId: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/tarjetas/${tarjetaId}/extracto`, {
          headers: encabezadosAuth(token),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible consultar el extracto (${res.status})`);
        setExtracto(body as ExtractoTarjeta);
        return body as ExtractoTarjeta;
      } catch (err: any) {
        setError(err.message || "Error inesperado consultando el extracto");
        return null;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token],
  );

  const cambiarBloqueo = useCallback(
    async (tarjetaId: string, motivo: string, bloquear: boolean) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/tarjetas/${bloquear ? "bloquear" : "desbloquear"}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ tarjetaId, motivo }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(body.message || `No fue posible ${bloquear ? "bloquear" : "desbloquear"} la tarjeta (${res.status})`);
        if (body.tarjeta) recordarTarjeta(body.tarjeta as Tarjeta);
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado actualizando el estado de la tarjeta");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token, recordarTarjeta],
  );

  const bloquear = useCallback((tarjetaId: string, motivo: string) => cambiarBloqueo(tarjetaId, motivo, true), [cambiarBloqueo]);
  const desbloquear = useCallback((tarjetaId: string, motivo: string) => cambiarBloqueo(tarjetaId, motivo, false), [cambiarBloqueo]);

  const simularAvance = useCallback(
    async (tarjetaId: string, monto: number, cuotas: number) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/tarjetas/avance`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ tarjetaId, monto, cuotas }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible simular el avance (${res.status})`);
        return body as { exito: boolean; transaccionId: string };
      } catch (err: any) {
        setError(err.message || "Error inesperado simulando el avance");
        return null;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token],
  );

  return {
    tarjetasConocidas,
    recordarTarjeta,
    cupo,
    extracto,
    cargando,
    error,
    emitir,
    consultarCupo,
    consultarExtracto,
    bloquear,
    desbloquear,
    simularAvance,
  };
}
