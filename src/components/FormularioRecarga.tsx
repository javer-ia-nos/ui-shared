import React from "react";
import { View, Text, Pressable } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { SelectorCuenta } from "./SelectorCuenta";
import { useRecarga, type UseRecargaOptions, type OperadorMovil } from "../hooks/useRecarga";

export interface FormularioRecargaProps extends UseRecargaOptions {}

const OPERADORES: OperadorMovil[] = ["CLARO", "MOVISTAR", "TIGO", "WOM"];

/** CU-27: recargas a operadores móviles, contra ms-transacciones. */
export function FormularioRecarga({ cuentaId, apiBaseUrl, token, onSuccess, onError }: FormularioRecargaProps) {
  const {
    cuentaId: cuenta,
    setCuentaId,
    operador,
    setOperador,
    numeroCelular,
    setNumeroCelular,
    monto,
    setMonto,
    cargando,
    error,
    resultado,
    recargar,
    reset,
  } = useRecarga({ cuentaId, apiBaseUrl, token, onSuccess, onError });

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 max-w-md w-full">
      <View className="flex-row items-center gap-2 mb-2">
        <Icono nombre="smartphone" color="#b5c4ff" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">Recarga de celular (CU-27)</Text>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      {resultado && (
        <View className="bg-tertiary-container rounded-xl px-4 py-3 gap-2">
          <Text className="text-on-tertiary-container font-body-sm text-body-sm">
            {resultado.mensaje || "¡Recarga exitosa!"} · Comprobante {resultado.numeroComprobante}
          </Text>
          <BotonBancario titulo="Hacer otra recarga" variante="secundario" onPress={reset} />
        </View>
      )}

      <SelectorCuenta etiqueta="Cuenta a debitar" token={token} onResuelta={(c) => setCuentaId(c.id)} />

      <View className="gap-1.5">
        <Text className="font-body-sm text-body-sm text-on-surface-variant mb-1">Operador</Text>
        <View className="flex-row flex-wrap gap-2">
          {OPERADORES.map((op) => (
            <Pressable
              key={op}
              onPress={() => setOperador(op)}
              className={`px-3 py-2 rounded-xl ${op === operador ? "bg-primary-container" : "bg-surface-container-high"}`}
            >
              <Text
                className={`font-label-md text-label-md ${op === operador ? "text-on-primary-container" : "text-on-surface-variant"}`}
              >
                {op}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <CampoTexto
        etiqueta="Número de celular"
        placeholder="3001234567"
        valor={numeroCelular}
        onCambio={setNumeroCelular}
        teclado="numeric"
      />
      <CampoTexto etiqueta="Monto (COP)" placeholder="20000" valor={monto} onCambio={setMonto} teclado="numeric" />

      <BotonBancario titulo={cargando ? "Procesando..." : "Recargar"} onPress={() => recargar()} disabled={cargando} />
    </Superficie>
  );
}
