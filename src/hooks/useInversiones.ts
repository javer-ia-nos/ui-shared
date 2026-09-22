import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";
import type { ProductoFinanciero } from "./useCDT";

/** Ítem de `GET /financiero/rendimientos` (CDT o inversión, con corte a la fecha). */
export interface Rendimiento {
  id: string;
  tipo: "CDT" | "INVESTMENT";
  monto: number;
  tasaEA: number;
  actual: number;
  proyectado: number;
  fechaVencimiento: string;
  estado: string;
}

export interface UseInversionesOptions {
  usuarioId?: string;
  userId?: string;
  apiBaseUrl?: string;
  token?: string;
  onSuccess?: (resultado: ProductoFinanciero) => void;
  onError?: (error: string) => void;
}

/** CU-12: creación de inversiones y consulta de rendimientos contra ms-financiero. */
export function useInversiones(options: UseInversionesOptions = {}) {
  const effectiveUsuarioId = options.usuarioId ?? options.userId ?? "";
  const baseUrl = options.apiBaseUrl ?? "/api/financiero";

  const [cuentaOrigen, setCuentaOrigen] = useState("");
  const [monto, setMonto] = useState("");
  const [codigoProducto, setCodigoProducto] = useState("");
  const [plazoDias, setPlazoDias] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ProductoFinanciero | null>(null);

  const [rendimientos, setRendimientos] = useState<Rendimiento[]>([]);
  const [cargandoRendimientos, setCargandoRendimientos] = useState(false);
  const [errorRendimientos, setErrorRendimientos] = useState<string | null>(null);

  const reset = useCallback(() => {
    setMonto("");
    setCodigoProducto("");
    setPlazoDias("");
    setError(null);
    setResultado(null);
  }, []);

  const cargarRendimientos = useCallback(async () => {
    if (!effectiveUsuarioId) return;
    setCargandoRendimientos(true);
    setErrorRendimientos(null);
    try {
      const res = await fetch(
        `${baseUrl}/financiero/rendimientos?usuarioId=${encodeURIComponent(effectiveUsuarioId)}`,
        { headers: encabezadosAuth(options.token) },
      );
      if (!res.ok) throw new Error(`No fue posible consultar los rendimientos (${res.status})`);
      setRendimientos((await res.json()) as Rendimiento[]);
    } catch (err: any) {
      setErrorRendimientos(err.message || "Error inesperado consultando rendimientos");
    } finally {
      setCargandoRendimientos(false);
    }
  }, [effectiveUsuarioId, baseUrl, options.token]);

  const crearInversion = useCallback(async () => {
    const valorMonto = parseFloat(monto);
    const valorPlazo = plazoDias ? parseInt(plazoDias, 10) : undefined;

    if (!cuentaOrigen) {
      const msg = "La cuenta de origen es requerida";
      setError(msg);
      options.onError?.(msg);
      return;
    }
    if (isNaN(valorMonto) || valorMonto <= 0) {
      const msg = "El monto debe ser un número mayor a cero";
      setError(msg);
      options.onError?.(msg);
      return;
    }
    if (!codigoProducto || codigoProducto.trim().length < 3) {
      const msg = "El código de producto debe tener al menos 3 caracteres";
      setError(msg);
      options.onError?.(msg);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const res = await fetch(`${baseUrl}/financiero/inversiones`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...encabezadosAuth(options.token) },
        body: JSON.stringify({
          usuarioId: effectiveUsuarioId,
          cuentaOrigen,
          monto: valorMonto,
          codigoProducto: codigoProducto.trim(),
          ...(valorPlazo !== undefined && !isNaN(valorPlazo) ? { plazoDias: valorPlazo } : {}),
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || `No fue posible crear la inversión (${res.status})`);

      const data = body as ProductoFinanciero;
      setResultado(data);
      options.onSuccess?.(data);
      await cargarRendimientos();
      return data;
    } catch (err: any) {
      const errorMsg = err.message || "Error inesperado creando la inversión";
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setCargando(false);
    }
  }, [effectiveUsuarioId, cuentaOrigen, monto, codigoProducto, plazoDias, baseUrl, options, cargarRendimientos]);

  return {
    cuentaOrigen,
    setCuentaOrigen,
    monto,
    setMonto,
    codigoProducto,
    setCodigoProducto,
    plazoDias,
    setPlazoDias,
    cargando,
    error,
    resultado,
    crearInversion,
    reset,
    rendimientos,
    cargandoRendimientos,
    errorRendimientos,
    cargarRendimientos,
  };
}
