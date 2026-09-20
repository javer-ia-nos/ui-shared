import React from "react";
import { View, Text } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { useLogin, type UseLoginOptions } from "../hooks/useLogin";
import type { LoginResultado } from "../types";

export interface FormularioLoginProps {
  apiBaseUrl?: string;
  onLogin?: (resultado: LoginResultado) => void;
}

/** CU-15: autenticación contra ms-seguridad. */
export function FormularioLogin({ apiBaseUrl, onLogin }: FormularioLoginProps) {
  const opciones: UseLoginOptions = { apiBaseUrl, onSuccess: onLogin };
  const { email, setEmail, password, setPassword, cargando, error, iniciarSesion } = useLogin(opciones);

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 max-w-md w-full">
      <View className="flex-row items-center gap-2 mb-2">
        <Icono nombre="lock" color="#b5c4ff" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">Iniciar sesión (CU-15)</Text>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      <CampoTexto etiqueta="Email" valor={email} onCambio={setEmail} placeholder="test@banco.com" />
      <CampoTexto etiqueta="Contraseña" valor={password} onCambio={setPassword} placeholder="••••••••" />

      <BotonBancario
        titulo={cargando ? "Ingresando..." : "Iniciar sesión"}
        onPress={() => iniciarSesion()}
        disabled={cargando}
      />
    </Superficie>
  );
}
