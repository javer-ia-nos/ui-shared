import React from "react";
import { Pressable, Text, type GestureResponderEvent } from "react-native";

export interface BotonBancarioProps {
  titulo: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  variante?: "primario" | "secundario" | "peligro";
  accessibilityLabel?: string;
}

const CLASES_VARIANTE: Record<NonNullable<BotonBancarioProps["variante"]>, { base: string; texto: string }> = {
  primario: { base: "bg-secondary-container", texto: "text-on-secondary-container" },
  secundario: { base: "bg-surface-container-high border border-outline-variant", texto: "text-on-surface" },
  peligro: { base: "bg-error", texto: "text-on-error" },
};

/**
 * Botón bancario universal construido sobre primitivas de React Native, con el
 * tema Material Design 3 (oscuro) del mockup de Stitch vía NativeWind.
 */
export function BotonBancario({
  titulo,
  onPress,
  disabled = false,
  variante = "primario",
  accessibilityLabel,
}: BotonBancarioProps) {
  const clases = CLASES_VARIANTE[variante];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || titulo}
      className={`py-3 px-5 rounded-2xl items-center justify-center min-h-12 active:opacity-85 ${clases.base} ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <Text className={`font-headline-sm text-headline-sm ${clases.texto}`}>{titulo}</Text>
    </Pressable>
  );
}
