import { useState, useCallback } from "react";
import type {
  CuentaResumen,
  BolsilloResumen,
  MovimientoResumen,
  CertificadoResumen,
} from "../components/PantallaInicioCuentas";
import { encabezadosAuth } from "../utils";

export interface UseInicioCuentasOptions {
  usuarioId: string;
  apiCuentasUrl?: string;
  apiTransaccionesUrl?: string;
  apiFinancieroUrl?: string;
  token?: string;
}

function mapCuenta(raw: any, tipoCuenta: "AHORROS" | "CORRIENTE"): CuentaResumen {
  return {
    id: raw.id,
    // Sin nombre "de fantasía": alias si el usuario le puso uno, si no una
    // etiqueta genérica derivada del tipo real de cuenta (accountType).
    titulo: raw.alias || (tipoCuenta === "AHORROS" ? "Cuenta de Ahorros" : "Cuenta Corriente"),
    numeroCuenta: raw.accountNumber,
    tipoCuenta,
    saldoDisponible: Number(raw.balance),
    etiquetaExtra: raw.status !== "ACTIVE" ? raw.status : undefined,
  };
}

function mapBolsillo(raw: any): BolsilloResumen {
  return { id: raw.id, nombre: raw.name, balance: Number(raw.balance), cuentaId: raw.parentAccountId };
}

function mapMovimiento(raw: any): MovimientoResumen {
  const esIngreso = raw.tipoOperacion === "CASH_DEPOSIT" || raw.tipoOperacion === "CHECK_DEPOSIT";
  const ETIQUETAS: Record<string, string> = {
    CASH_DEPOSIT: "Depósito en efectivo",
    CHECK_DEPOSIT: "Depósito con cheque",
    CASH_WITHDRAWAL: "Retiro presencial",
  };
  return {
    id: raw.id,
    titulo: ETIQUETAS[raw.tipoOperacion] || raw.tipoOperacion,
    // El listado (GET /pagos-fisicos/cuenta/:id) devuelve "descripcion", no
    // "numeroComprobante" (ese solo viene en la respuesta de creación) — se usa
    // lo que de verdad entrega cada endpoint, sin inventar un campo que falte.
    detalle: raw.descripcion || `Sucursal ${raw.sucursalId} · Cajero ${raw.cajeroId}`,
    fecha: raw.fecha,
    monto: Number(raw.monto),
    esIngreso,
  };
}

function mapCertificado(raw: any): CertificadoResumen {
  return {
    id: raw.id,
    tipoCertificado: raw.tipoCertificado,
    codigoVerificacion: raw.codigoVerificacion,
    fechaEmision: raw.fechaEmision,
    estado: raw.estado,
  };
}

/**
 * Agrega, contra APIs reales, todo lo que necesita la pantalla de Inicio &
 * Cuentas: ms-cuentas (cuentas + subcuentas/bolsillos), ms-transacciones (pagos
 * presenciales, CU-28) y ms-financiero (certificados, CU-10). Sin datos quemados:
 * si un servicio no responde, esa sección queda vacía, no se inventa contenido.
 */
export function useInicioCuentas({
  usuarioId,
  apiCuentasUrl = "/api/cuentas",
  apiTransaccionesUrl = "/api/transacciones",
  apiFinancieroUrl = "/api/financiero",
  token,
}: UseInicioCuentasOptions) {
  const [cuentas, setCuentas] = useState<CuentaResumen[]>([]);
  const [bolsillos, setBolsillos] = useState<BolsilloResumen[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoResumen[]>([]);
  const [certificados, setCertificados] = useState<CertificadoResumen[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!usuarioId) return;
    setCargando(true);
    setError(null);
    try {
      const authHeaders = encabezadosAuth(token);
      const [corrientesRes, ahorrosRes, certificadosRes] = await Promise.all([
        fetch(`${apiCuentasUrl}/cuentas/corrientes?userId=${usuarioId}`, { headers: authHeaders }),
        fetch(`${apiCuentasUrl}/cuentas/ahorros?userId=${usuarioId}`, { headers: authHeaders }),
        fetch(`${apiFinancieroUrl}/financiero/certificados?usuarioId=${usuarioId}`, { headers: authHeaders }),
      ]);

      const corrientes = corrientesRes.ok ? await corrientesRes.json() : [];
      const ahorros = ahorrosRes.ok ? await ahorrosRes.json() : [];
      const certs = certificadosRes.ok ? await certificadosRes.json() : [];

      const todasCuentas: CuentaResumen[] = [
        ...corrientes.map((c: any) => mapCuenta(c, "CORRIENTE")),
        ...ahorros.map((c: any) => mapCuenta(c, "AHORROS")),
      ];
      setCuentas(todasCuentas);
      setCertificados(certs.map(mapCertificado));

      const subResultados = await Promise.all(
        todasCuentas.map((c) =>
          fetch(`${apiCuentasUrl}/cuentas/${c.id}/subcuentas`, { headers: authHeaders }).then((r) =>
            r.ok ? r.json() : null
          )
        )
      );
      setBolsillos(
        subResultados
          .filter((r): r is { subcuentas: any[] } => r !== null)
          .flatMap((r) => r.subcuentas.map(mapBolsillo))
      );

      const movResultados = await Promise.all(
        todasCuentas.map((c) =>
          fetch(`${apiTransaccionesUrl}/pagos-fisicos/cuenta/${c.id}`, { headers: authHeaders }).then((r) =>
            r.ok ? r.json() : []
          )
        )
      );
      setMovimientos(movResultados.flat().map(mapMovimiento));
    } catch (err: any) {
      setError(err.message || "Error consultando la información de la cuenta");
    } finally {
      setCargando(false);
    }
  }, [usuarioId, apiCuentasUrl, apiTransaccionesUrl, apiFinancieroUrl, token]);

  const generarCertificado = useCallback(
    async (tipoCertificado: string) => {
      const res = await fetch(`${apiFinancieroUrl}/financiero/certificados`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...encabezadosAuth(token) },
        body: JSON.stringify({ usuarioId, tipoCertificado }),
      });
      if (res.ok) await cargar();
      return res.ok;
    },
    [usuarioId, apiFinancieroUrl, token, cargar]
  );

  return { cuentas, bolsillos, movimientos, certificados, cargando, error, cargar, generarCertificado };
}
