import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export interface PagoExternoResultado {
  id: string;
  numeroComprobante: string;
  estado: string;
  monto: number;
  mensaje: string;
}

export interface UsePagoFacturaOptions {
  cuentaId?: string;
  apiBaseUrl?: string;
  token?: string;
  onSuccess?: (resultado: PagoExternoResultado) => void;
  onError?: (error: string) => void;
}

/** Hook headless para CU-27 (pago de facturas de servicios por convenio), vía api-gateway. */
export function usePagoFactura(options: UsePagoFacturaOptions = {}) {
  const [cuentaId, setCuentaId] = useState(options.cuentaId ?? "");
  const [codigoConvenio, setCodigoConvenio] = useState("");
  const [referenciaFactura, setReferenciaFactura] = useState("");
  const [monto, setMonto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<PagoExternoResultado | null>(null);

  const reset = useCallback(() => {
    setCodigoConvenio("");
    setReferenciaFactura("");
    setMonto("");
    setError(null);
    setResultado(null);
  }, []);

  const pagar = useCallback(async () => {
    const valorNumerico = parseFloat(monto);
    if (!cuentaId || !codigoConvenio || !referenciaFactura) {
      const msg = "Cuenta, código de convenio y referencia de factura son requeridos";
      setError(msg);
      options.onError?.(msg);
      return;
    }
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      const msg = "El monto debe ser un número mayor a cero";
      setError(msg);
      options.onError?.(msg);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const baseUrl = options.apiBaseUrl ?? "/api/transacciones";
      const res = await fetch(`${baseUrl}/pagos-facturas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...encabezadosAuth(options.token) },
        body: JSON.stringify({ cuentaId, codigoConvenio, referenciaFactura, monto: valorNumerico }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || `Error pagando la factura (${res.status})`);
      }

      setResultado(body as PagoExternoResultado);
      options.onSuccess?.(body as PagoExternoResultado);
      return body as PagoExternoResultado;
    } catch (err: any) {
      const errorMsg = err.message || "Error inesperado pagando la factura";
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setCargando(false);
    }
  }, [cuentaId, codigoConvenio, referenciaFactura, monto, options]);

  return {
    cuentaId,
    setCuentaId,
    codigoConvenio,
    setCodigoConvenio,
    referenciaFactura,
    setReferenciaFactura,
    monto,
    setMonto,
    cargando,
    error,
    resultado,
    pagar,
    reset,
  };
}
