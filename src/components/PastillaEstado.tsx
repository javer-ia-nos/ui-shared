import React from "react";
import { View, Text } from "react-native";

export interface PastillaEstadoProps {
  texto: string;
  tono?: "secondary" | "tertiary" | "primary" | "error" | "neutral";
  conPunto?: boolean;
}

const CLASES_TONO: Record<NonNullable<PastillaEstadoProps["tono"]>, { fondo: string; texto: string; punto: string }> = {
  secondary: { fondo: "bg-secondary-container/20", texto: "text-secondary", punto: "bg-secondary" },
  tertiary: { fondo: "bg-tertiary-container/30", texto: "text-tertiary", punto: "bg-tertiary" },
  primary: { fondo: "bg-primary-container/60", texto: "text-primary", punto: "bg-primary" },
  error: { fondo: "bg-error-container", texto: "text-on-error-container", punto: "bg-error" },
  neutral: { fondo: "bg-surface-container-high", texto: "text-on-surface-variant", punto: "bg-outline" },
};

/**
 * Badge redondeado con punto de color + texto — usado en el mockup para estados
 * ("sync", "Aprobada") y etiquetas de ASR/CU ("ASR-01: SLA 99.99%").
 */
export function PastillaEstado({ texto, tono = "neutral", conPunto = true }: PastillaEstadoProps) {
  const clases = CLASES_TONO[tono];
  return (
    <View className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${clases.fondo}`}>
      {conPunto && <View className={`w-1.5 h-1.5 rounded-full ${clases.punto}`} />}
      <Text className={`font-label-caps text-label-caps uppercase tracking-wider ${clases.texto}`}>{texto}</Text>
    </View>
  );
}
