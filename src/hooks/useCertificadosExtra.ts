import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export interface ValidacionCertificado {
  valido: boolean;
  mensaje: string;
  certificado?: {
    codigoVerificacion: string;
    tipoCertificado: string;
    destinatario: string;
    fechaEmision: string;
    fechaVencimiento: string;
    estado: string;
  };
}

export interface AnulacionCertificado {
  id: string;
  codigoVerificacion: string;
  estado: string;
  mensaje: string;
}

export interface UseCertificadosExtraOptions {
  apiBaseUrl?: string;
  token?: string;
}

/** CU-10: validación pública de certificados y anulación, vía api-gateway. */
export function useCertificadosExtra({ apiBaseUrl, token }: UseCertificadosExtraOptions = {}) {
  const baseUrl = apiBaseUrl ?? "/api/financiero";
  const [resultado, setResultado] = useState<ValidacionCertificado | null>(null);
  const [anulacion, setAnulacion] = useState<AnulacionCertificado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validar = useCallback(
    async (codigo: string) => {
      if (!codigo) return;
      setCargando(true);
      setError(null);
      setResultado(null);
      try {
        const res = await fetch(`${baseUrl}/certificados/validar/${encodeURIComponent(codigo)}`, {
          headers: encabezadosAuth(token),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.message || `No fue posible validar el certificado (${res.status})`);
        }
        setResultado(body as ValidacionCertificado);
        return body as ValidacionCertificado;
      } catch (err: any) {
        setError(err.message || "Error inesperado validando el certificado");
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token],
  );

  const anular = useCallback(
    async (certificadoId: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/certificados/${certificadoId}/anular`, {
          method: "POST",
          headers: encabezadosAuth(token),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.message || `No fue posible anular el certificado (${res.status})`);
        }
        setAnulacion(body as AnulacionCertificado);
        return body as AnulacionCertificado;
      } catch (err: any) {
        setError(err.message || "Error inesperado anulando el certificado");
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, token],
  );

  return { resultado, anulacion, cargando, error, validar, anular };
}
