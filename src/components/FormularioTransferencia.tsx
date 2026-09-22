import React from "react";
import { View, Text } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { useTransferencia, type UseTransferenciaOptions } from "../hooks/useTransferencia";

export interface FormularioTransferenciaProps extends UseTransferenciaOptions {}

/** CU-05: transferencia entre cuentas contra ms-transacciones. */
export function FormularioTransferencia({ apiBaseUrl, token, onSuccess, onError }: FormularioTransferenciaProps) {
  const {
    cuentaOrigen,
    setCuentaOrigen,
    cuentaDestino,
    setCuentaDestino,
    monto,
    setMonto,
    descripcion,
    setDescripcion,
    cargando,
    error,
    exito,
    ejecutarTransferencia,
    reset,
  } = useTransferencia({ apiBaseUrl, token, onSuccess, onError });

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 max-w-md w-full">
      <View className="flex-row items-center gap-2 mb-2">
        <Icono nombre="swap_horiz" color="#b5c4ff" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">Nueva transferencia (CU-05)</Text>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      {exito && (
        <View className="bg-tertiary-container rounded-xl px-4 py-3 gap-2">
          <Text className="text-on-tertiary-container font-body-sm text-body-sm">
            ¡Transferencia realizada con éxito!
          </Text>
          <BotonBancario titulo="Hacer otra transferencia" variante="secundario" onPress={reset} />
        </View>
      )}

      <CampoTexto
        etiqueta="Cuenta origen (UUID)"
        placeholder="00000000-0000-0000-0000-000000000001"
        valor={cuentaOrigen}
        onCambio={setCuentaOrigen}
      />

      <CampoTexto
        etiqueta="Cuenta destino (UUID)"
        placeholder="00000000-0000-0000-0000-000000000002"
        valor={cuentaDestino}
        onCambio={setCuentaDestino}
      />

      <CampoTexto
        etiqueta="Monto (COP)"
        placeholder="50000"
        valor={monto}
        onCambio={setMonto}
        teclado="numeric"
      />

      <CampoTexto
        etiqueta="Descripción (opcional)"
        placeholder="Pago de arriendo"
        valor={descripcion}
        onCambio={setDescripcion}
      />

      <BotonBancario
        titulo={cargando ? "Procesando..." : "Enviar transferencia"}
        onPress={() => ejecutarTransferencia()}
        disabled={cargando}
      />
    </Superficie>
  );
}
