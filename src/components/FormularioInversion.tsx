import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { PastillaEstado } from "./PastillaEstado";
import { SelectorCuenta } from "./SelectorCuenta";
import { useInversiones, type UseInversionesOptions, type Rendimiento } from "../hooks/useInversiones";
import { formatearMoneda, formatearFecha } from "../utils";

export interface FormularioInversionProps extends UseInversionesOptions {}

function TarjetaRendimiento({ item }: { item: Rendimiento }) {
  return (
    <View className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 gap-1">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <Text className="font-title-md text-title-md text-on-surface">
          {item.tipo === "CDT" ? "CDT" : "Inversión"}
        </Text>
        <PastillaEstado texto={item.estado} tono={item.estado === "ACTIVE" ? "secondary" : "neutral"} />
      </View>
      <Text className="font-body-sm text-body-sm text-on-surface-variant">
        Capital: {formatearMoneda(item.monto)} · Tasa EA: {(item.tasaEA * 100).toFixed(2)}%
      </Text>
      <View className="flex-row flex-wrap gap-4 mt-1">
        <View>
          <Text className="font-label-sm text-label-sm text-on-surface-variant">Rendimiento actual</Text>
          <Text className="font-title-md text-title-md text-primary">{formatearMoneda(item.actual)}</Text>
        </View>
        <View>
          <Text className="font-label-sm text-label-sm text-on-surface-variant">Proyectado al vencimiento</Text>
          <Text className="font-title-md text-title-md text-secondary">{formatearMoneda(item.proyectado)}</Text>
        </View>
      </View>
      <Text className="font-label-sm text-label-sm text-on-surface-variant/80 mt-1">
        Vence el {formatearFecha(item.fechaVencimiento)}
      </Text>
    </View>
  );
}

/** CU-12: creación de inversiones y consulta de rendimientos (CDT + inversiones). */
export function FormularioInversion(props: FormularioInversionProps) {
  const {
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
  } = useInversiones(props);

  useEffect(() => {
    cargarRendimientos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.usuarioId, props.userId]);

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 w-full">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <Icono nombre="trending_up" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">Inversiones (CU-12)</Text>
        </View>
        <BotonBancario
          titulo={cargandoRendimientos ? "Actualizando..." : "Refrescar"}
          variante="secundario"
          onPress={() => cargarRendimientos()}
          disabled={cargandoRendimientos}
        />
      </View>

      {errorRendimientos && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{errorRendimientos}</Text>
        </View>
      )}

      {rendimientos.length === 0 && !cargandoRendimientos ? (
        <View className="py-6 items-center justify-center bg-surface-container/50 rounded-2xl">
          <Text className="text-on-surface-variant font-body-md text-body-md">
            Este usuario todavía no tiene CDTs ni inversiones activas.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {rendimientos.map((item) => (
            <TarjetaRendimiento key={item.id} item={item} />
          ))}
        </View>
      )}

      <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-4 mt-2">
        <Text className="font-title-md text-title-md text-on-surface">Crear nueva inversión</Text>

        {error && (
          <View className="bg-error-container rounded-xl px-4 py-3">
            <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
          </View>
        )}

        {resultado && (
          <View className="bg-tertiary-container rounded-xl px-4 py-3 gap-2">
            <Text className="text-on-tertiary-container font-body-sm text-body-sm">{resultado.mensaje}</Text>
            <BotonBancario titulo="Crear otra inversión" variante="secundario" onPress={reset} />
          </View>
        )}

        {!resultado && (
          <>
            <View className="gap-1.5">
              <Text className="font-body-sm text-body-sm text-on-surface-variant">Cuenta origen</Text>
              <SelectorCuenta token={props.token} onResuelta={(c) => setCuentaOrigen(c.id)} />
            </View>
            <CampoTexto
              etiqueta="Código de producto"
              placeholder="FIC-RENTA-FIJA"
              valor={codigoProducto}
              onCambio={setCodigoProducto}
            />
            <CampoTexto
              etiqueta="Monto (COP)"
              placeholder="2000000"
              valor={monto}
              onCambio={setMonto}
              teclado="numeric"
            />
            <CampoTexto
              etiqueta="Plazo (días, opcional)"
              placeholder="180"
              valor={plazoDias}
              onCambio={setPlazoDias}
              teclado="numeric"
            />
            <BotonBancario
              titulo={cargando ? "Procesando..." : "Crear inversión"}
              onPress={() => crearInversion()}
              disabled={cargando}
            />
          </>
        )}
      </Superficie>
    </Superficie>
  );
}
