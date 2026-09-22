import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export interface CuotaPrestamo {
  numero: number;
  monto: number;
  capital: number;
  interes: number;
  fechaVencimiento: string;
  estado: string;
}

/** Respuesta de ms-financiero para préstamos (`PrestamoResponseSchema`). */
export interface Prestamo {
  id: string;
  usuarioId: string;
  montoAprobado: number;
  tasaEA: number;
  plazoMeses: number;
  cuotaMensual: number;
  estado: string;
  cuotas: CuotaPrestamo[];
  mensaje: string;
}

export interface UsePrestamosOptions {
  usuarioId?: string;
  userId?: string;
  apiBaseUrl?: string;
  token?: string;
  onSuccess?: (resultado: Prestamo) => void;
  onError?: (error: string) => void;
}

/** CU-13: solicitud, consulta y pago de cuotas de préstamos contra ms-financiero. */
export function usePrestamos(options: UsePrestamosOptions = {}) {
  const effectiveUsuarioId = options.usuarioId ?? options.userId ?? "";
  const baseUrl = options.apiBaseUrl ?? "/api/financiero";

  const [montoSolicitado, setMontoSolicitado] = useState("");
  const [plazoMeses, setPlazoMeses] = useState("");
  const [ingresoMensual, setIngresoMensual] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prestamo, setPrestamo] = useState<Prestamo | null>(null);
  const [cargandoCuota, setCargandoCuota] = useState<number | null>(null);

  const reset = useCallback(() => {
    setMontoSolicitado("");
    setPlazoMeses("");
    setIngresoMensual("");
    setError(null);
  }, []);

  const consultarPrestamo = useCallback(
    async (id: string) => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/prestamos/${id}`, {
          headers: encabezadosAuth(options.token),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible consultar el préstamo (${res.status})`);
        const data = body as Prestamo;
        setPrestamo(data);
        return data;
      } catch (err: any) {
        setError(err.message || "Error inesperado consultando el préstamo");
      } finally {
        setCargando(false);
      }
    },
    [baseUrl, options.token],
  );

  const solicitarPrestamo = useCallback(async () => {
    const valorMonto = parseFloat(montoSolicitado);
    const valorPlazo = parseInt(plazoMeses, 10);
    const valorIngreso = parseFloat(ingresoMensual);

    if (isNaN(valorMonto) || valorMonto <= 0) {
      const msg = "El monto solicitado debe ser mayor a cero";
      setError(msg);
      options.onError?.(msg);
      return;
    }
    if (isNaN(valorPlazo) || valorPlazo < 6 || valorPlazo > 120) {
      const msg = "El plazo debe estar entre 6 y 120 meses";
      setError(msg);
      options.onError?.(msg);
      return;
    }
    if (isNaN(valorIngreso) || valorIngreso <= 0) {
      const msg = "El ingreso mensual debe ser mayor a cero";
      setError(msg);
      options.onError?.(msg);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const res = await fetch(`${baseUrl}/prestamos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...encabezadosAuth(options.token) },
        body: JSON.stringify({
          usuarioId: effectiveUsuarioId,
          montoSolicitado: valorMonto,
          plazoMeses: valorPlazo,
          ingresoMensual: valorIngreso,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || `No fue posible solicitar el préstamo (${res.status})`);

      const data = body as Prestamo;
      setPrestamo(data);
      options.onSuccess?.(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || "Error inesperado solicitando el préstamo";
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setCargando(false);
    }
  }, [effectiveUsuarioId, montoSolicitado, plazoMeses, ingresoMensual, baseUrl, options]);

  const pagarCuota = useCallback(
    async (prestamoId: string, numero: number, cuentaOrigen: string) => {
      setCargandoCuota(numero);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/prestamos/${prestamoId}/cuotas/${numero}/pagos`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...encabezadosAuth(options.token) },
          body: JSON.stringify({ cuentaOrigen }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `No fue posible pagar la cuota (${res.status})`);
        await consultarPrestamo(prestamoId);
        return true;
      } catch (err: any) {
        setError(err.message || "Error inesperado pagando la cuota");
        return false;
      } finally {
        setCargandoCuota(null);
      }
    },
    [baseUrl, options.token, consultarPrestamo],
  );

  return {
    montoSolicitado,
    setMontoSolicitado,
    plazoMeses,
    setPlazoMeses,
    ingresoMensual,
    setIngresoMensual,
    cargando,
    error,
    prestamo,
    solicitarPrestamo,
    consultarPrestamo,
    pagarCuota,
    cargandoCuota,
    reset,
  };
}
