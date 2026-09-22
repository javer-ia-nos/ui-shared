import React from "react";
import { View, Text, Pressable } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import {
  useTransferenciaInternacional,
  type UseTransferenciaInternacionalOptions,
} from "../hooks/useTransferenciaInternacional";

export interface FormularioTransferenciaInternacionalProps extends UseTransferenciaInternacionalOptions {}

/** CU-26: transferencias internacionales e interbancarias contra ms-transacciones. */
export function FormularioTransferenciaInternacional({
  apiBaseUrl,
  token,
  onSuccess,
  onError,
}: FormularioTransferenciaInternacionalProps) {
  const {
    cuentaOrigen,
    setCuentaOrigen,
    cuentaDestino,
    setCuentaDestino,
    bancoDestino,
    setBancoDestino,
    monto,
    setMonto,
    moneda,
    setMoneda,
    isInternational,
    setIsInternational,
    codigoSwift,
    setCodigoSwift,
    descripcion,
    setDescripcion,
    cargando,
    error,
    resultado,
    ejecutar,
    reset,
  } = useTransferenciaInternacional({ apiBaseUrl, token, onSuccess, onError });

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 max-w-md w-full">
      <View className="flex-row items-center gap-2 mb-2">
        <Icono nombre="public" color="#b5c4ff" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">
          Transferencia internacional / interbancaria (CU-26)
        </Text>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      {resultado && (
        <View className="bg-tertiary-container rounded-xl px-4 py-3 gap-2">
          <Text className="text-on-tertiary-container font-body-sm text-body-sm">
            {resultado.mensaje || "¡Transferencia enviada!"}
          </Text>
          <Text className="text-on-tertiary-container font-body-sm text-body-sm font-mono">
            Referencia de liquidación: {resultado.referenciaLiquidacion}
          </Text>
          <BotonBancario titulo="Hacer otra transferencia" variante="secundario" onPress={reset} />
        </View>
      )}

      <View className="flex-row gap-2">
        <Pressable
          onPress={() => setIsInternational(true)}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            isInternational ? "bg-primary-container" : "bg-surface-container-high"
          }`}
        >
          <Text
            className={`font-label-md text-label-md ${isInternational ? "text-on-primary-container" : "text-on-surface-variant"}`}
          >
            Al exterior
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setIsInternational(false)}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            !isInternational ? "bg-primary-container" : "bg-surface-container-high"
          }`}
        >
          <Text
            className={`font-label-md text-label-md ${!isInternational ? "text-on-primary-container" : "text-on-surface-variant"}`}
          >
            Interbancaria nacional
          </Text>
        </Pressable>
      </View>

      <CampoTexto
        etiqueta="Cuenta origen (UUID)"
        placeholder="00000000-0000-0000-0000-000000000001"
        valor={cuentaOrigen}
        onCambio={setCuentaOrigen}
      />
      <CampoTexto
        etiqueta="Cuenta destino / IBAN"
        placeholder="DE89370400440532013000"
        valor={cuentaDestino}
        onCambio={setCuentaDestino}
      />
      <CampoTexto
        etiqueta="Banco destino"
        placeholder="Deutsche Bank"
        valor={bancoDestino}
        onCambio={setBancoDestino}
      />
      <CampoTexto etiqueta="Monto" placeholder="500000" valor={monto} onCambio={setMonto} teclado="numeric" />
      <CampoTexto etiqueta="Divisa" placeholder="USD" valor={moneda} onCambio={setMoneda} />
      {isInternational && (
        <CampoTexto
          etiqueta="Código SWIFT/BIC (opcional)"
          placeholder="DEUTDEFF"
          valor={codigoSwift}
          onCambio={setCodigoSwift}
        />
      )}
      <CampoTexto
        etiqueta="Descripción (opcional)"
        placeholder="Pago proveedor internacional"
        valor={descripcion}
        onCambio={setDescripcion}
      />

      <BotonBancario
        titulo={cargando ? "Procesando..." : "Enviar transferencia"}
        onPress={() => ejecutar()}
        disabled={cargando}
      />
    </Superficie>
  );
}
