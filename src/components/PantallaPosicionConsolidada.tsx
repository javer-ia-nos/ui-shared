import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { BotonBancario } from "./BotonBancario";
import { PastillaEstado } from "./PastillaEstado";
import { usePosicionConsolidada, type UsePosicionConsolidadaOptions } from "../hooks/usePosicionConsolidada";
import { formatearMoneda, formatearFecha } from "../utils";

export interface PantallaPosicionConsolidadaProps extends UsePosicionConsolidadaOptions {}

/** CU-11: dashboard financiero consolidado (activos, pasivos, patrimonio y productos). */
export function PantallaPosicionConsolidada(props: PantallaPosicionConsolidadaProps) {
  const { posicion, cargando, error, cargar } = usePosicionConsolidada(props);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.userId, props.usuarioId]);

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-6 w-full">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <Icono nombre="trending_up" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">
            Posición consolidada (CU-11)
          </Text>
        </View>
        <BotonBancario
          titulo={cargando ? "Actualizando..." : "Refrescar"}
          variante="secundario"
          onPress={() => cargar()}
          disabled={cargando}
        />
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      {cargando && !posicion && (
        <Text className="text-on-surface-variant font-body-sm text-body-sm">Cargando posición consolidada…</Text>
      )}

      {posicion && (
        <>
          <View className="flex-row flex-wrap gap-4">
            <View className="flex-1 min-w-[45%] p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
              <Text className="text-on-surface-variant font-label-md text-label-md">Total activos</Text>
              <Text className="font-headline-sm text-headline-sm text-primary mt-1">
                {formatearMoneda(posicion.resumen.totalActivos)}
              </Text>
            </View>
            <View className="flex-1 min-w-[45%] p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
              <Text className="text-on-surface-variant font-label-md text-label-md">Total pasivos</Text>
              <Text className="font-headline-sm text-headline-sm text-error mt-1">
                {formatearMoneda(posicion.resumen.totalPasivos)}
              </Text>
            </View>
            <View className="flex-1 min-w-[45%] p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
              <Text className="text-on-surface-variant font-label-md text-label-md">Patrimonio neto</Text>
              <Text className="font-headline-sm text-headline-sm text-secondary mt-1">
                {formatearMoneda(posicion.resumen.patrimonioNeto)}
              </Text>
            </View>
            <View className="flex-1 min-w-[45%] p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
              <Text className="text-on-surface-variant font-label-md text-label-md">Saldo disponible global</Text>
              <Text className="font-headline-sm text-headline-sm text-tertiary mt-1">
                {formatearMoneda(posicion.resumen.saldoDisponibleGlobal)}
              </Text>
            </View>
          </View>

          {posicion.productos.cuentas.length > 0 && (
            <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-3">
              <Text className="font-title-md text-title-md text-on-surface">Cuentas</Text>
              {posicion.productos.cuentas.map((c) => (
                <View
                  key={c.id}
                  className="flex-row flex-wrap items-center justify-between gap-2 p-3 bg-surface-container rounded-xl"
                >
                  <View className="flex-1 min-w-[140px]">
                    <Text className="font-body-md text-body-md text-on-surface">{c.tipo} · {c.numeroCuenta}</Text>
                    <PastillaEstado texto={c.estado} tono={c.estado === "ACTIVE" ? "secondary" : "neutral"} />
                  </View>
                  <Text className="font-title-md text-title-md text-primary">{formatearMoneda(c.saldo)}</Text>
                </View>
              ))}
            </Superficie>
          )}

          {posicion.productos.tarjetas.length > 0 && (
            <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-3">
              <Text className="font-title-md text-title-md text-on-surface">Tarjetas</Text>
              {posicion.productos.tarjetas.map((t) => (
                <View key={t.id} className="p-3 bg-surface-container rounded-xl gap-1">
                  <Text className="font-body-md text-body-md text-on-surface">
                    {t.franquicia} •••• {t.ultimosDigitos}
                  </Text>
                  <Text className="font-body-sm text-body-sm text-on-surface-variant">
                    Cupo disponible {formatearMoneda(t.cupoDisponible)} de {formatearMoneda(t.cupoTotal)}
                  </Text>
                  {t.saldoPendiente > 0 && (
                    <Text className="font-body-sm text-body-sm text-error">
                      Saldo pendiente {formatearMoneda(t.saldoPendiente)}
                    </Text>
                  )}
                </View>
              ))}
            </Superficie>
          )}

          {posicion.productos.inversiones.length > 0 && (
            <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-3">
              <Text className="font-title-md text-title-md text-on-surface">Inversiones y CDTs</Text>
              {posicion.productos.inversiones.map((i) => (
                <View
                  key={i.id}
                  className="flex-row flex-wrap items-center justify-between gap-2 p-3 bg-surface-container rounded-xl"
                >
                  <View className="flex-1 min-w-[140px]">
                    <Text className="font-body-md text-body-md text-on-surface">
                      {i.tipo} · {i.tasaEA}% E.A.
                    </Text>
                    <Text className="font-body-sm text-body-sm text-on-surface-variant">
                      Vence {formatearFecha(i.fechaVencimiento)}
                    </Text>
                  </View>
                  <Text className="font-title-md text-title-md text-secondary">{formatearMoneda(i.monto)}</Text>
                </View>
              ))}
            </Superficie>
          )}

          {posicion.productos.prestamos.length > 0 && (
            <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-3">
              <Text className="font-title-md text-title-md text-on-surface">Préstamos</Text>
              {posicion.productos.prestamos.map((p) => (
                <View key={p.id} className="p-3 bg-surface-container rounded-xl gap-1">
                  <View className="flex-row flex-wrap items-center justify-between gap-2">
                    <Text className="font-body-md text-body-md text-on-surface">Saldo pendiente</Text>
                    <Text className="font-title-md text-title-md text-error">{formatearMoneda(p.saldoPendiente)}</Text>
                  </View>
                  <Text className="font-body-sm text-body-sm text-on-surface-variant">
                    Cuota mensual {formatearMoneda(p.cuotaMensual)} · {p.estado}
                  </Text>
                </View>
              ))}
            </Superficie>
          )}
        </>
      )}
    </Superficie>
  );
}
