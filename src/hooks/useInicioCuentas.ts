import { useState, useCallback } from "react";
import type {
  CuentaResumen,
  BolsilloResumen,
  MovimientoResumen,
  CertificadoResumen,
} from "../components/PantallaInicioCuentas";
import { encabezadosAuth } from "../utils";

export interface UseInicioCuentasOptions {
  userId?: string;
  usuarioId?: string;
  apiCuentasUrl?: string;
  apiTransaccionesUrl?: string;
  apiFinancieroUrl?: string;
  token?: string;
}

function mapCuenta(
  raw: any,
  tipoCuenta: "AHORROS" | "CORRIENTE",
): CuentaResumen {
  return {
    id: raw.id,
    titulo:
      raw.alias ||
      (tipoCuenta === "AHORROS" ? "Cuenta de Ahorros" : "Cuenta Corriente"),
    numeroCuenta: raw.accountNumber,
    tipoCuenta,
    saldoDisponible: Number(raw.balance),
    etiquetaExtra: raw.status !== "ACTIVE" ? raw.status : undefined,
  };
}

function mapBolsillo(raw: any): BolsilloResumen {
  return {
    id: raw.id,
    nombre: raw.name,
    balance: Number(raw.balance),
    cuentaId: raw.parentAccountId,
  };
}

function mapMovimiento(
  raw: any,
  userAccountIds: string[] = [],
): MovimientoResumen {
  const monto = Number(raw.amount ?? raw.monto ?? 0);
  const fecha =
    raw.occurredAt ||
    raw.fecha ||
    raw.fechaOperacion ||
    new Date().toISOString();

  // Depósito presencial o abono/transferencia recibida es ingreso (+)
  const isPhysicalDeposit =
    raw.operationType === "CASH_DEPOSIT" ||
    raw.operationType === "CHECK_DEPOSIT" ||
    raw.tipoOperacion === "CASH_DEPOSIT" ||
    raw.tipoOperacion === "CHECK_DEPOSIT" ||
    raw.transactionTypeCode === "PHYSICAL_DEPOSIT";

  const isIncomingTransfer = Boolean(
    raw.destinationAccountId &&
      userAccountIds.includes(raw.destinationAccountId) &&
      raw.sourceAccountId !== raw.destinationAccountId,
  );

  const esIngreso = isPhysicalDeposit || isIncomingTransfer;

  let titulo =
    raw.description ||
    raw.descripcion ||
    raw.transactionTypeDescription;

  if (!titulo || titulo === "Transacción") {
    if (raw.transactionTypeCode === "TRANSFER_OWN") {
      titulo = "Transferencia entre cuentas propias";
    } else if (raw.transactionTypeCode === "TRANSFER_THIRD") {
      titulo = "Transferencia a terceros";
    } else if (raw.transactionTypeCode === "TRANSFER_INTER") {
      titulo = "Transferencia interbancaria";
    } else if (raw.transactionTypeCode === "TRANSFER_INTL") {
      titulo = "Transferencia internacional";
    } else if (raw.transactionTypeCode === "QR_PAYMENT") {
      titulo = "Pago con código QR";
    } else if (raw.transactionTypeCode === "BILL_PAYMENT") {
      titulo = "Pago de servicios y facturas";
    } else if (raw.operationType === "CASH_DEPOSIT" || raw.tipoOperacion === "CASH_DEPOSIT") {
      titulo = "Depósito en efectivo";
    } else if (raw.operationType === "CHECK_DEPOSIT" || raw.tipoOperacion === "CHECK_DEPOSIT") {
      titulo = "Depósito con cheque";
    } else if (raw.operationType === "CASH_WITHDRAWAL" || raw.tipoOperacion === "CASH_WITHDRAWAL") {
      titulo = "Retiro presencial";
    } else if (esIngreso) {
      titulo = "Abono / Ingreso a cuenta";
    } else {
      titulo = "Operación financiera";
    }
  }

  const refId = raw.id ? String(raw.id).slice(0, 8).toUpperCase() : "";
  let detalle = `Comprobante #${refId || "—"}`;
  if (raw.numeroCheque) {
    detalle = `Cheque #${raw.numeroCheque} · ${raw.bancoCheque ?? "Ventanilla"}`;
  } else if (raw.merchantName) {
    detalle = `Comercio: ${raw.merchantName}`;
  } else if (raw.billerName) {
    detalle = `Convenio: ${raw.billerName}`;
  } else if (raw.status) {
    detalle = `Comprobante #${refId} · ${raw.status}`;
  }

  return {
    id: raw.id,
    titulo,
    detalle,
    fecha,
    monto,
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
 * Cuentas: ms-cuentas (cuentas + subcuentas/bolsillos), ms-transacciones (libro mayor
 * de transferencias, QR, pagos y pagos presenciales) y ms-financiero (certificados, CU-10).
 */
export function useInicioCuentas({
  userId,
  usuarioId,
  apiCuentasUrl = "/api/cuentas",
  apiTransaccionesUrl = "/api/transacciones",
  apiFinancieroUrl = "/api/financiero",
  token,
}: UseInicioCuentasOptions) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const [cuentas, setCuentas] = useState<CuentaResumen[]>([]);
  const [bolsillos, setBolsillos] = useState<BolsilloResumen[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoResumen[]>([]);
  const [certificados, setCertificados] = useState<CertificadoResumen[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!effectiveUserId) return;
    setCargando(true);
    setError(null);
    try {
      const authHeaders = encabezadosAuth(token);
      const [corrientesRes, ahorrosRes, certificadosRes] = await Promise.all([
        fetch(`${apiCuentasUrl}/cuentas/corrientes?userId=${effectiveUserId}`, {
          headers: authHeaders,
        }),
        fetch(`${apiCuentasUrl}/cuentas/ahorros?userId=${effectiveUserId}`, {
          headers: authHeaders,
        }),
        fetch(
          `${apiFinancieroUrl}/financiero/certificados?usuarioId=${effectiveUserId}`,
          { headers: authHeaders },
        ),
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
          fetch(`${apiCuentasUrl}/cuentas/${c.id}/subcuentas`, {
            headers: authHeaders,
          }).then((r) => (r.ok ? r.json() : null)),
        ),
      );
      setBolsillos(
        subResultados
          .filter((r): r is { subcuentas: any[] } => r !== null)
          .flatMap((r) => r.subcuentas.map(mapBolsillo)),
      );

      const cuentasIds = todasCuentas.map((c) => c.id);
      const movResultados = await Promise.all(
        todasCuentas.map(async (c) => {
          // 1. Libro mayor unificado de transacciones (CU-30, CU-25, CU-27, CU-28)
          const txRes = await fetch(
            `${apiTransaccionesUrl}/transactions?sourceAccountId=${c.id}`,
            { headers: authHeaders },
          ).catch(() => null);

          if (txRes && txRes.ok) {
            const data = await txRes.json().catch(() => []);
            if (Array.isArray(data) && data.length > 0) {
              return data;
            }
          }

          // 2. Fallback a pagos presenciales (CU-28)
          const fisicosRes = await fetch(
            `${apiTransaccionesUrl}/pagos-fisicos/cuenta/${c.id}`,
            { headers: authHeaders },
          ).catch(() => null);

          if (fisicosRes && fisicosRes.ok) {
            const data = await fisicosRes.json().catch(() => []);
            if (Array.isArray(data)) {
              return data;
            }
          }

          return [];
        }),
      );

      const vistos = new Set<string>();
      const todosMovs = movResultados
        .flat()
        .filter((m: any) => {
          if (!m?.id || vistos.has(m.id)) return false;
          vistos.add(m.id);
          return true;
        })
        .map((m: any) => mapMovimiento(m, cuentasIds));

      todosMovs.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );

      setMovimientos(todosMovs);
    } catch (err: any) {
      setError(err.message || "Error consultando la información de la cuenta");
    } finally {
      setCargando(false);
    }
  }, [
    effectiveUserId,
    apiCuentasUrl,
    apiTransaccionesUrl,
    apiFinancieroUrl,
    token,
  ]);

  const generarCertificado = useCallback(
    async (tipoCertificado: string) => {
      const res = await fetch(`${apiFinancieroUrl}/financiero/certificados`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...encabezadosAuth(token),
        },
        body: JSON.stringify({ usuarioId: effectiveUserId, tipoCertificado }),
      });
      if (res.ok) await cargar();
      return res.ok;
    },
    [effectiveUserId, apiFinancieroUrl, token, cargar],
  );

  return {
    cuentas,
    bolsillos,
    movimientos,
    certificados,
    cargando,
    error,
    cargar,
    generarCertificado,
  };
}
