import React from "react";
import { View, Text, TextInput, type KeyboardTypeOptions } from "react-native";

export interface CampoTextoProps {
  etiqueta: string;
  valor: string;
  onCambio: (texto: string) => void;
  placeholder?: string;
  teclado?: KeyboardTypeOptions;
  error?: string | null;
  accessibilityLabel?: string;
}

/**
 * Campo de texto con etiqueta universal (Web y Móvil), con el tema Material Design 3
 * (oscuro) del mockup de Stitch vía NativeWind.
 */
export function CampoTexto({
  etiqueta,
  valor,
  onCambio,
  placeholder,
  teclado = "default",
  error,
  accessibilityLabel,
}: CampoTextoProps) {
  return (
    <View className="mb-1">
      <Text className="font-body-sm text-body-sm text-on-surface-variant mb-1.5">{etiqueta}</Text>
      <TextInput
        value={valor}
        onChangeText={onCambio}
        placeholder={placeholder}
        placeholderTextColor="#8e9098"
        keyboardType={teclado}
        className={`bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl px-4 py-3 ${
          error ? "border border-error" : ""
        }`}
        accessibilityLabel={accessibilityLabel || etiqueta}
      />
      {error && <Text className="text-error font-body-sm text-body-sm mt-1">{error}</Text>}
    </View>
  );
}
