import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export interface QRGenerado {
  qrToken: string;
  destinationAccountId: string;
  merchantName: string;
  amount?: number;
  currency: string;
  description?: string;
  expiresAt: string;
}

export interface QRDecodificado {
  valid: boolean;
  destinationAccountId: string;
  merchantName: string;
  amount?: number;
  currency: string;
  description?: string;
  expiresAt: string;
  isExpired: boolean;
}

export interface ComprobanteQR {
  id: string;
  qrPaymentId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  merchantName: string;
  amount: number;
  currency: string;
  status: string;
  numeroComprobante: string;
  occurredAt: string;
}

export interface UsePagosQROptions {
  apiBaseUrl?: string;
  token?: string;
}

/**
 * Hook headless para CU-25 (pagos con código QR): generar, decodificar y pagar,
 * vía api-gateway → ms-transacciones. Sin librería de cámara/escaneo instalada:
 * el "escaneo" es pegar/teclear el `qrToken` que ya trae el contrato de la API.
 */
export function usePagosQR(options: UsePagosQROptions = {}) {
  const baseUrl = options.apiBaseUrl ?? "/api/transacciones";

  const [generando, setGenerando] = useState(false);
  const [errorGenerar, setErrorGenerar] = useState<string | null>(null);
  const [qrGenerado, setQrGenerado] = useState<QRGenerado | null>(null);

  const [decodificando, setDecodificando] = useState(false);
  const [errorDecodificar, setErrorDecodificar] = useState<string | null>(null);
  const [qrDecodificado, setQrDecodificado] = useState<QRDecodificado | null>(null);

  const [pagando, setPagando] = useState(false);
  const [errorPagar, setErrorPagar] = useState<string | null>(null);
  const [comprobante, setComprobante] = useState<ComprobanteQR | null>(null);

  const generar = useCallback(
    async (payload: {
      destinationAccountId: string;
      merchantName: string;
      amount?: number;
      currency?: string;
      description?: string;
      expiresInMinutes?: number;
    }) => {
      setGenerando(true);
      setErrorGenerar(null);
      try {
        const res = await fetch(`${baseUrl}/qr/generar`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(options.token) },
          body: JSON.stringify(payload),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible generar el QR (${res.status})`);
        setQrGenerado(body as QRGenerado);
        return body as QRGenerado;
      } catch (err: any) {
        setErrorGenerar(err.message || "Error inesperado generando el QR");
      } finally {
        setGenerando(false);
      }
    },
    [baseUrl, options.token],
  );

  const decodificar = useCallback(
    async (qrToken: string) => {
      setDecodificando(true);
      setErrorDecodificar(null);
      setQrDecodificado(null);
      try {
        const res = await fetch(`${baseUrl}/qr/decodificar`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(options.token) },
          body: JSON.stringify({ qrToken }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible leer el QR (${res.status})`);
        setQrDecodificado(body as QRDecodificado);
        return body as QRDecodificado;
      } catch (err: any) {
        setErrorDecodificar(err.message || "Error inesperado leyendo el QR");
      } finally {
        setDecodificando(false);
      }
    },
    [baseUrl, options.token],
  );

  const pagar = useCallback(
    async (payload: { sourceAccountId: string; qrToken: string; amount?: number; description?: string }) => {
      setPagando(true);
      setErrorPagar(null);
      try {
        const res = await fetch(`${baseUrl}/qr/pagar`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(options.token) },
          body: JSON.stringify(payload),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible pagar el QR (${res.status})`);
        setComprobante(body as ComprobanteQR);
        return body as ComprobanteQR;
      } catch (err: any) {
        setErrorPagar(err.message || "Error inesperado pagando el QR");
      } finally {
        setPagando(false);
      }
    },
    [baseUrl, options.token],
  );

  const resetPago = useCallback(() => {
    setQrDecodificado(null);
    setComprobante(null);
    setErrorDecodificar(null);
    setErrorPagar(null);
  }, []);

  return {
    generando,
    errorGenerar,
    qrGenerado,
    generar,
    decodificando,
    errorDecodificar,
    qrDecodificado,
    decodificar,
    pagando,
    errorPagar,
    comprobante,
    pagar,
    resetPago,
  };
}
