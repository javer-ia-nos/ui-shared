import React from "react";
import { Pressable, Text, StyleSheet, type GestureResponderEvent } from "react-native";

export interface BotonBancarioProps {
  titulo: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  variante?: "primario" | "secundario" | "peligro";
  accessibilityLabel?: string;
}

/**
 * Botón bancario universal construido sobre primitivas de React Native
 * compatible directamente con react-native-web sin tocar el DOM.
 */
export function BotonBancario({
  titulo,
  onPress,
  disabled = false,
  variante = "primario",
  accessibilityLabel,
}: BotonBancarioProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || titulo}
      style={({ pressed }) => [
        styles.base,
        variante === "primario" && styles.primario,
        variante === "secundario" && styles.secundario,
        variante === "peligro" && styles.peligro,
        pressed && styles.presionado,
        disabled && styles.deshabilitado,
      ]}
    >
      <Text
        style={[
          styles.textoBase,
          variante === "secundario" ? styles.textoSecundario : styles.textoBlanco,
          disabled && styles.textoDeshabilitado,
        ]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primario: {
    backgroundColor: "#004884",
  },
  secundario: {
    backgroundColor: "#e8eff7",
    borderWidth: 1,
    borderColor: "#004884",
  },
  peligro: {
    backgroundColor: "#d32f2f",
  },
  presionado: {
    opacity: 0.85,
  },
  deshabilitado: {
    backgroundColor: "#cccccc",
    borderColor: "#cccccc",
  },
  textoBase: {
    fontSize: 16,
    fontWeight: "600",
  },
  textoBlanco: {
    color: "#ffffff",
  },
  textoSecundario: {
    color: "#004884",
  },
  textoDeshabilitado: {
    color: "#666666",
  },
});
