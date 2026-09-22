import React from "react";
import { View, Text } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { useCambioPassword, type UseCambioPasswordOptions } from "../hooks/useCambioPassword";

export interface FormularioCambioPasswordProps extends UseCambioPasswordOptions {}

/** Cambio de contraseña contra ms-seguridad (PUT /security/password). */
export function FormularioCambioPassword({
  userId,
  usuarioId,
  apiBaseUrl,
  token,
}: FormularioCambioPasswordProps) {
  const {
    passwordActual,
    setPasswordActual,
    passwordNueva,
    setPasswordNueva,
    cargando,
    error,
    exito,
    cambiar,
  } = useCambioPassword({ userId, usuarioId, apiBaseUrl, token });

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 w-full">
      <View className="flex-row items-center gap-2">
        <Icono nombre="lock" color="#b5c4ff" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">
          Cambiar contraseña
        </Text>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      {exito && (
        <View className="bg-tertiary-container rounded-xl px-4 py-3">
          <Text className="text-on-tertiary-container font-body-sm text-body-sm">
            Contraseña actualizada correctamente.
          </Text>
        </View>
      )}

      <CampoTexto
        etiqueta="Contraseña actual"
        valor={passwordActual}
        onCambio={setPasswordActual}
        placeholder="••••••••"
      />
      <CampoTexto
        etiqueta="Nueva contraseña"
        valor={passwordNueva}
        onCambio={setPasswordNueva}
        placeholder="Mínimo 8 caracteres"
      />

      <BotonBancario
        titulo={cargando ? "Actualizando..." : "Cambiar contraseña"}
        onPress={() => cambiar()}
        disabled={cargando}
      />
    </Superficie>
  );
}
