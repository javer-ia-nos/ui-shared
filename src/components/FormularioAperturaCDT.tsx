import React from "react";
import { View, Text } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { SelectorCuenta } from "./SelectorCuenta";
import { useCDT, type UseCDTOptions } from "../hooks/useCDT";
import { formatearMoneda, formatearFecha } from "../utils";

export interface FormularioAperturaCDTProps extends UseCDTOptions {}

/** CU-12: apertura de CDT (Certificado de Depósito a Término). */
export function FormularioAperturaCDT(props: FormularioAperturaCDTProps) {
  const {
    cuentaOrigen,
    setCuentaOrigen,
    monto,
    setMonto,
    plazoDias,
    setPlazoDias,
    cargando,
    error,
    resultado,
    abrirCDT,
    reset,
  } = useCDT(props);

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 w-full">
      <View className="flex-row items-center gap-2 mb-2">
        <Icono nombre="savings" color="#b5c4ff" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">Abrir CDT (CU-12)</Text>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      {resultado && (
        <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-2">
          <View className="flex-row items-center gap-2">
            <Icono nombre="check_circle" color="#84d896" />
            <Text className="font-title-md text-title-md text-on-surface">{resultado.mensaje}</Text>
          </View>
          <Text className="font-body-sm text-body-sm text-on-surface-variant">
            Monto: {formatearMoneda(resultado.monto)} · Tasa EA: {(resultado.tasaEA * 100).toFixed(2)}%
          </Text>
          <Text className="font-body-sm text-body-sm text-on-surface-variant">
            Vence el {formatearFecha(resultado.fechaVencimiento)} · Estado: {resultado.estado}
          </Text>
          <BotonBancario titulo="Abrir otro CDT" variante="secundario" onPress={reset} />
        </Superficie>
      )}

      {!resultado && (
        <>
          <View className="gap-1.5">
            <Text className="font-body-sm text-body-sm text-on-surface-variant">Cuenta origen</Text>
            <SelectorCuenta token={props.token} onResuelta={(c) => setCuentaOrigen(c.id)} />
          </View>
          <CampoTexto
            etiqueta="Monto (COP)"
            placeholder="5000000"
            valor={monto}
            onCambio={setMonto}
            teclado="numeric"
          />
          <CampoTexto
            etiqueta="Plazo (días, 30-1825)"
            placeholder="90"
            valor={plazoDias}
            onCambio={setPlazoDias}
            teclado="numeric"
          />
          <BotonBancario
            titulo={cargando ? "Procesando..." : "Abrir CDT"}
            onPress={() => abrirCDT()}
            disabled={cargando}
          />
        </>
      )}
    </Superficie>
  );
}
