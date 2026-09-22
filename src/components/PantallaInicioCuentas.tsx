import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Superficie } from "./Superficie";
import { TarjetaSaldo } from "./TarjetaSaldo";
import { BotonBancario } from "./BotonBancario";
import { PastillaEstado } from "./PastillaEstado";
import { Icono } from "./Icono";
import { AccountCard } from "./AccountCard";
import { QuickActions, type AccionRapida } from "./QuickActions";
import { TransactionLedger } from "./TransactionLedger";
import { SecuritySummary } from "./SecuritySummary";
import { SelectorCuenta } from "./SelectorCuenta";
import { PantallaPosicionConsolidada } from "./PantallaPosicionConsolidada";
import { PantallaExtracto } from "./PantallaExtracto";
import { FormularioAperturaCuenta } from "./FormularioAperturaCuenta";
import { GestionCuenta } from "./GestionCuenta";
import { GestionBolsillos } from "./GestionBolsillos";
import { GestionAhorroAutomatico } from "./GestionAhorroAutomatico";
import { FormularioRecarga } from "./FormularioRecarga";
import { PantallaPagosQR } from "./PantallaPagosQR";
import { FormularioPagoPresencial } from "./FormularioPagoPresencial";
import { GestionPagosProgramados } from "./GestionPagosProgramados";
import { FormularioCambioPassword } from "./FormularioCambioPassword";
import { PastillaPermisos } from "./PastillaPermisos";
import { ValidadorCertificado } from "./ValidadorCertificado";
import { formatearFecha, formatearMoneda } from "../utils";
import { useInicioCuentas, type UseInicioCuentasOptions } from "../hooks/useInicioCuentas";
import type { CuentaResuelta } from "../hooks/useResolverCuenta";

export interface CuentaResumen {
  id: string;
  titulo: string;
  numeroCuenta: string;
  tipoCuenta: "AHORROS" | "CORRIENTE";
  saldoDisponible: number;
  etiquetaExtra?: string;
}

export interface BolsilloResumen {
  id: string;
  nombre: string;
  balance: number;
  cuentaId: string;
}

export interface MovimientoResumen {
  id: string;
  titulo: string;
  detalle: string;
  fecha: string;
  monto: number;
  esIngreso?: boolean;
}

export interface CertificadoResumen {
  id: string;
  tipoCertificado: string;
  codigoVerificacion: string;
  fechaEmision: string;
  estado: string;
}

export interface PantallaInicioCuentasProps extends UseInicioCuentasOptions {
  /** Navegación a las otras 3 pantallas universales, resuelta por la app anfitriona. */
  onAccionRapida?: (accion: AccionRapida) => void;
  onVerSeguridad?: () => void;
}

/**
 * Pantalla universal "Inicio & Cuentas" (spec Stitch): saldo consolidado,
 * cuentas, bolsillos, accesos rápidos, registro de actividad y resumen de
 * seguridad — TODO consultado en vivo contra ms-cuentas/ms-transacciones/
 * ms-financiero/ms-seguridad. Sin usuarioId no hay nada que mostrar (no
 * existen datos "de ejemplo"). En viewport móvil es un flujo vertical; en
 * `lg:` (desktop) pasa a una retícula tipo Bento Grid.
 */
export function PantallaInicioCuentas({ onAccionRapida, onVerSeguridad, ...opciones }: PantallaInicioCuentasProps) {
  const { cuentas, bolsillos, movimientos, certificados, cargando, error, cargar, generarCertificado } =
    useInicioCuentas(opciones);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opciones.usuarioId, opciones.userId]);

  const saldoConsolidado = cuentas.reduce((total, cuenta) => total + cuenta.saldoDisponible, 0);
  const ingresos = movimientos.filter((m) => m.esIngreso).reduce((t, m) => t + m.monto, 0);
  const egresos = movimientos.filter((m) => !m.esIngreso).reduce((t, m) => t + m.monto, 0);
  const ahorroActivo = bolsillos.reduce((t, b) => t + b.balance, 0);

  return (
    <View className="gap-8 p-4">
      {error && (
        <Superficie nivel="container" redondeo="2xl" padding="lg" className="bg-error-container">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </Superficie>
      )}

      {cargando && cuentas.length === 0 && (
        <Text className="text-on-surface-variant font-body-sm text-body-sm">Cargando cuentas…</Text>
      )}

      {!cargando && cuentas.length === 0 && !error && (
        <Superficie nivel="container" redondeo="2xl" padding="lg">
          <Text className="text-on-surface-variant font-body-sm text-body-sm">
            Este usuario todavía no tiene cuentas abiertas en ms-cuentas.
          </Text>
        </Superficie>
      )}

      {/* SECCIÓN 1: Hero de balance consolidado + KPIs (spec Stitch) */}
      {cuentas[0] && (
        <Superficie nivel="container-high" redondeo="2xl" padding="lg" className="gap-6 lg:flex-row lg:items-center lg:justify-between">
          <View className="lg:flex-1">
            <TarjetaSaldo
              numeroCuenta={cuentas[0].numeroCuenta}
              tipoCuenta={cuentas[0].tipoCuenta}
              saldoDisponible={saldoConsolidado}
            />
          </View>
          <View className="flex-row flex-wrap gap-3 lg:flex-nowrap">
            <Superficie nivel="container" redondeo="xl" padding="md" className="gap-1 flex-1 min-w-[150px]">
              <Text className="font-body-sm text-body-sm text-on-surface-variant">Ingresos registrados</Text>
              <Text className="font-label-numeric-md text-label-numeric-md text-[#10B981] font-semibold">
                +{formatearMoneda(ingresos)}
              </Text>
            </Superficie>
            <Superficie nivel="container" redondeo="xl" padding="md" className="gap-1 flex-1 min-w-[150px]">
              <Text className="font-body-sm text-body-sm text-on-surface-variant">Gastos / Pagos</Text>
              <Text className="font-label-numeric-md text-label-numeric-md text-on-surface font-semibold">
                -{formatearMoneda(egresos)}
              </Text>
            </Superficie>
            <Superficie nivel="container" redondeo="xl" padding="md" className="gap-1 flex-1 min-w-[150px]">
              <Text className="font-body-sm text-body-sm text-on-surface-variant">Ahorro Activo</Text>
              <Text className="font-label-numeric-md text-label-numeric-md text-tertiary font-semibold">
                {formatearMoneda(ahorroActivo)}
              </Text>
            </Superficie>
          </View>
        </Superficie>
      )}

      {/* SECCIÓN 2: Accesos rápidos universales */}
      {onAccionRapida && (
        <QuickActions onAccion={onAccionRapida} certificadoDeshabilitado={cargando || cuentas.length === 0} />
      )}

      {/* SECCIÓN 3: Panel dividido — cuentas + registro de actividad (izq) / seguridad + certificados (der) */}
      <View className="gap-6 lg:flex-row lg:items-start">
        <View className="gap-6 lg:flex-1">
          {(cuentas.length > 0 || bolsillos.length > 0) && (
            <View className="gap-4">
              <Text className="font-headline-md text-headline-md text-on-surface">Cuentas & Bolsillos Activos</Text>
              <View className="gap-4 lg:flex-row lg:flex-wrap">
                {cuentas.map((cuenta) => (
                  <AccountCard key={cuenta.id} cuenta={cuenta} />
                ))}
                {bolsillos.map((bolsillo) => (
                  <AccountCard key={bolsillo.id} bolsillo={bolsillo} />
                ))}
              </View>
            </View>
          )}

          {movimientos.length > 0 && (
            <Superficie nivel="container" redondeo="2xl" padding="lg" className="gap-4">
              <View>
                <Text className="font-headline-md text-headline-md text-on-surface">Movimientos Recientes</Text>
                <Text className="font-body-sm text-body-sm text-on-surface-variant">
                  Registro inmutable de transferencias, recaudos y rendimientos
                </Text>
              </View>
              <TransactionLedger movimientos={movimientos} />
            </Superficie>
          )}
        </View>

        <View className="gap-4 lg:w-[320px] lg:flex-shrink-0">
          <SecuritySummary {...opciones} onVerMas={onVerSeguridad} />

          <Superficie nivel="container" redondeo="2xl" padding="lg" className="gap-3">
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="font-label-caps text-label-caps uppercase text-tertiary">Trámite Institucional</Text>
                <Text className="font-headline-sm text-headline-sm text-on-surface">Certificación Bancaria</Text>
              </View>
              <View className="p-2.5 rounded-xl bg-tertiary-container">
                <Icono nombre="picture_as_pdf" color="#ffb955" />
              </View>
            </View>
            <Text className="font-body-sm text-body-sm text-on-surface-variant">
              Documento oficial con código de verificación, generado contra ms-financiero.
            </Text>
            <BotonBancario
              titulo={cargando ? "Generando…" : "Descargar Certificado Oficial"}
              onPress={() => generarCertificado("CONSOLIDADO")}
              disabled={cargando || cuentas.length === 0}
            />
          </Superficie>
        </View>
      </View>

      {/* Certificados ya emitidos (CU-10) */}
      {certificados.length > 0 && (
        <View className="gap-4">
          <Text className="font-headline-md text-headline-md text-on-surface">Certificaciones & Extractos (CU-10)</Text>
          <View className="gap-4 lg:flex-row lg:flex-wrap">
            {certificados.map((cert) => (
              <Superficie key={cert.id} nivel="container" redondeo="2xl" padding="lg" className="gap-2 lg:flex-1 lg:min-w-[260px]">
                <View className="flex-row flex-wrap items-center justify-between gap-2">
                  <Text className="font-headline-sm text-headline-sm text-on-surface">{cert.tipoCertificado}</Text>
                  <PastillaEstado texto={cert.estado} tono={cert.estado === "ACTIVE" ? "secondary" : "neutral"} />
                </View>
                <Text className="font-label-code text-body-sm text-on-surface-variant">
                  {cert.codigoVerificacion} · emitido {formatearFecha(cert.fechaEmision)}
                </Text>
              </Superficie>
            ))}
          </View>
        </View>
      )}

      <ServiciosAdicionales usuarioId={opciones.userId ?? opciones.usuarioId} token={opciones.token} />
    </View>
  );
}

/**
 * Acciones secundarias que no tienen pantalla propia en las 4 universales del
 * spec de Stitch (apertura/gestión de cuenta, bolsillos, ahorro automático,
 * recargas, QR, pagos presenciales, pagos programados, cambio de contraseña,
 * permisos y validación de certificados) — se mantienen accesibles acá,
 * colapsadas, para no perder cobertura funcional de los CU existentes.
 */
function ServiciosAdicionales({ usuarioId, token }: { usuarioId?: string; token?: string }) {
  const [visible, setVisible] = useState(false);
  const [cuenta, setCuenta] = useState<CuentaResuelta | null>(null);
  const effectiveUserId = usuarioId ?? "";

  return (
    <View className="gap-4">
      <BotonBancario
        titulo={visible ? "Ocultar más servicios" : "Más servicios"}
        variante="secundario"
        onPress={() => setVisible((v) => !v)}
      />
      {visible && (
        <View className="gap-6">
          <PantallaPosicionConsolidada userId={effectiveUserId} token={token} />

          <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-2">
            <SelectorCuenta etiqueta="Cuenta para consultar extracto o gestionar" token={token} onResuelta={setCuenta} />
          </Superficie>
          {cuenta && (
            <>
              <PantallaExtracto cuentaId={cuenta.id} token={token} />
              <GestionCuenta
                cuentaId={cuenta.id}
                tipoCuenta={cuenta.accountType === "SAVINGS" ? "AHORROS" : "CORRIENTE"}
                token={token}
              />
              <GestionBolsillos cuentaId={cuenta.id} token={token} />
              <GestionAhorroAutomatico cuentaId={cuenta.id} token={token} />
              <GestionPagosProgramados cuentaOrigen={cuenta.id} token={token} />
            </>
          )}

          <FormularioRecarga token={token} />
          <PantallaPagosQR token={token} />
          <FormularioPagoPresencial token={token} />

          <FormularioAperturaCuenta userId={effectiveUserId} token={token} />
          <FormularioCambioPassword userId={effectiveUserId} token={token} />
          <PastillaPermisos userId={effectiveUserId} token={token} />
          <ValidadorCertificado token={token} />
        </View>
      )}
    </View>
  );
}
