import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { Icono } from "./Icono";
import { Superficie } from "./Superficie";
import { PastillaEstado } from "./PastillaEstado";
import { TarjetaSaldo } from "./TarjetaSaldo";
import { BotonBancario } from "./BotonBancario";
import { formatearMoneda, formatearFecha, enmascararCuenta } from "../utils";
import { useInicioCuentas, type UseInicioCuentasOptions } from "../hooks/useInicioCuentas";

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

export interface PantallaInicioCuentasProps extends UseInicioCuentasOptions {}

/**
 * Pantalla "Inicio & Cuentas": saldo consolidado, cuentas, bolsillos (subcuentas),
 * historial de pagos presenciales (CU-28) y certificados (CU-10) — TODO consultado
 * en vivo contra ms-cuentas/ms-transacciones/ms-financiero. Sin usuarioId no hay
 * nada que mostrar (no existen datos "de ejemplo").
 */
export function PantallaInicioCuentas(props: PantallaInicioCuentasProps) {
  const { cuentas, bolsillos, movimientos, certificados, cargando, error, cargar, generarCertificado } =
    useInicioCuentas(props);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.usuarioId]);

  const saldoConsolidado = cuentas.reduce((total, cuenta) => total + cuenta.saldoDisponible, 0);

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

      {cuentas[0] && (
        <TarjetaSaldo numeroCuenta={cuentas[0].numeroCuenta} tipoCuenta={cuentas[0].tipoCuenta} saldoDisponible={saldoConsolidado} />
      )}

      {/* Cuentas */}
      {cuentas.length > 0 && (
        <View className="gap-4">
          <Text className="font-headline-lg text-headline-lg text-on-surface">
            Cuentas de Ahorros & Corrientes
          </Text>
          <View className="gap-4">
            {cuentas.map((cuenta) => (
              <Superficie key={cuenta.id} nivel="container-high" redondeo="2xl" padding="lg" className="gap-4">
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-1 gap-1">
                    <Text className="font-body-md text-body-md font-semibold text-on-surface">
                      {cuenta.titulo}
                    </Text>
                    <Text className="font-label-code text-body-md text-on-surface-variant">
                      No. {enmascararCuenta(cuenta.numeroCuenta)}
                    </Text>
                  </View>
                  <View className="items-end gap-1">
                    <PastillaEstado texto={cuenta.etiquetaExtra || "Activa"} tono="secondary" conPunto={false} />
                  </View>
                </View>
                <View>
                  <Text className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                    Saldo Disponible
                  </Text>
                  <Text className="font-label-numeric-lg text-headline-lg text-on-surface font-bold">
                    {formatearMoneda(cuenta.saldoDisponible)}
                  </Text>
                </View>
              </Superficie>
            ))}
          </View>
        </View>
      )}

      {/* Bolsillos (subcuentas, CU-08) */}
      {bolsillos.length > 0 && (
        <View className="gap-4">
          <Text className="font-headline-lg text-headline-lg text-on-surface">Bolsillos (CU-08)</Text>
          <View className="gap-4">
            {bolsillos.map((bolsillo) => (
              <Superficie key={bolsillo.id} nivel="container" redondeo="2xl" padding="lg" className="gap-2">
                <Text className="font-headline-sm text-headline-sm text-on-surface">{bolsillo.nombre}</Text>
                <Text className="font-label-numeric-lg text-headline-sm text-secondary font-bold">
                  {formatearMoneda(bolsillo.balance)}
                </Text>
              </Superficie>
            ))}
          </View>
        </View>
      )}

      {/* Pagos presenciales (CU-28) */}
      {movimientos.length > 0 && (
        <View className="gap-4">
          <Text className="font-headline-lg text-headline-lg text-on-surface">
            Historial de Pagos Presenciales (CU-28)
          </Text>
          <Superficie nivel="container" redondeo="2xl" padding="sm" className="gap-1">
            {movimientos.map((mov) => (
              <View key={mov.id} className="flex-row items-center justify-between gap-3 p-3 rounded-xl">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 rounded-xl bg-surface-container-highest items-center justify-center">
                    <Icono nombre={mov.esIngreso ? "swap_horiz" : "account_balance"} color="#b1c7f0" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-on-surface" numberOfLines={1}>
                      {mov.titulo}
                    </Text>
                    <Text className="font-body-sm text-body-sm text-on-surface-variant" numberOfLines={1}>
                      {mov.detalle}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text
                    className={`font-label-numeric-md font-bold ${mov.esIngreso ? "text-secondary" : "text-on-surface"}`}
                  >
                    {mov.esIngreso ? "+" : "-"} {formatearMoneda(mov.monto)}
                  </Text>
                  <Text className="font-body-sm text-body-sm text-on-surface-variant">
                    {formatearFecha(mov.fecha)}
                  </Text>
                </View>
              </View>
            ))}
          </Superficie>
        </View>
      )}

      {/* Certificados (CU-10) */}
      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-headline-lg text-headline-lg text-on-surface">
            Certificaciones & Extractos (CU-10)
          </Text>
          <BotonBancario
            titulo="Generar certificado"
            variante="secundario"
            onPress={() => generarCertificado("CONSOLIDADO")}
            disabled={cargando || cuentas.length === 0}
          />
        </View>
        {certificados.length === 0 ? (
          <Text className="text-on-surface-variant font-body-sm text-body-sm">
            Este usuario todavía no ha generado certificados.
          </Text>
        ) : (
          <View className="gap-4">
            {certificados.map((cert) => (
              <Superficie key={cert.id} nivel="container" redondeo="2xl" padding="lg" className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="font-headline-sm text-headline-sm text-on-surface">{cert.tipoCertificado}</Text>
                  <PastillaEstado texto={cert.estado} tono={cert.estado === "ACTIVE" ? "secondary" : "neutral"} />
                </View>
                <Text className="font-label-code text-body-sm text-on-surface-variant">
                  {cert.codigoVerificacion} · emitido {formatearFecha(cert.fechaEmision)}
                </Text>
              </Superficie>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
