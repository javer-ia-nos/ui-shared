import { useState, useCallback, useMemo } from "react";
import { encabezadosAuth } from "../utils";

export type RemitenteChat = "CLIENTE" | "AGENTE" | "BOT";
export type TipoPqrs = "PETICION" | "QUEJA" | "RECLAMO" | "SOLICITUD";

export interface MensajeChat {
  id: string;
  sessionId: string;
  senderType: RemitenteChat;
  message: string;
  createdAt: string;
}

export interface Pqrs {
  id: string;
  userId: string;
  type: TipoPqrs;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface Disputa {
  id: string;
  transactionId: string;
  userId: string;
  reason: string;
  status: string;
  createdAt: string;
}

export interface UseCrmOptions {
  userId?: string;
  usuarioId?: string;
  apiBaseUrl?: string;
  token?: string;
}

/**
 * Hook headless para ms-crm (vía api-gateway /api/crm): chat de atención al
 * cliente, radicación de PQRS y disputas de transacciones. sessionId se
 * genera una sola vez por instancia del hook (crypto.randomUUID), consistente
 * con lo que exige MensajeChatSchema (uuid).
 */
export function useCrm({ userId, usuarioId, apiBaseUrl, token }: UseCrmOptions) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const baseUrl = apiBaseUrl ?? "/api/crm";
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [pqrsActivas, setPqrsActivas] = useState<Pqrs[]>([]);
  const [disputasActivas, setDisputasActivas] = useState<Disputa[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarHistorial = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/crm/chat/historial/${sessionId}`, {
        headers: encabezadosAuth(token),
      });
      if (res.status === 404) {
        setMensajes([]);
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || `No fue posible consultar el historial (${res.status})`);
      setMensajes((Array.isArray(body) ? body : []) as MensajeChat[]);
    } catch (err: any) {
      setError(err.message || "Error inesperado consultando el historial del chat");
    } finally {
      setCargando(false);
    }
  }, [baseUrl, sessionId, token]);

  const enviarMensaje = useCallback(
    async (contenido: string, remitente: RemitenteChat = "CLIENTE") => {
      if (!contenido.trim()) return false;
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/crm/chat/mensaje`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ sessionId, remitente, contenido }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible enviar el mensaje (${res.status})`);
        await cargarHistorial();
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado enviando el mensaje");
        return false;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, sessionId, token, cargarHistorial],
  );

  const radicarPqrs = useCallback(
    async (tipo: TipoPqrs, asunto: string, descripcion: string) => {
      if (!effectiveUserId) return null;
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/crm/pqrs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ userId: effectiveUserId, tipo, asunto, descripcion }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible radicar la PQRS (${res.status})`);
        setPqrsActivas((previas) => [body as Pqrs, ...previas]);
        return body as Pqrs;
      } catch (err: any) {
        setError(err.message || "Error inesperado radicando la PQRS");
        return null;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, effectiveUserId, token],
  );

  const iniciarDisputa = useCallback(
    async (transactionId: string, motivo: string) => {
      if (!effectiveUserId) return null;
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/crm/disputas`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
          body: JSON.stringify({ transactionId, userId: effectiveUserId, motivo }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible iniciar la disputa (${res.status})`);
        setDisputasActivas((previas) => [body as Disputa, ...previas]);
        return body as Disputa;
      } catch (err: any) {
        setError(err.message || "Error inesperado iniciando la disputa");
        return null;
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, effectiveUserId, token],
  );

  return {
    sessionId,
    mensajes,
    pqrsActivas,
    disputasActivas,
    cargando,
    error,
    cargarHistorial,
    enviarMensaje,
    radicarPqrs,
    iniciarDisputa,
  };
}
