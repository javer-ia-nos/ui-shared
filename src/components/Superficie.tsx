import React from "react";
import { View, type ViewProps } from "react-native";

export type NivelSuperficie =
  | "container-lowest"
  | "container-low"
  | "container"
  | "container-high"
  | "container-highest";

export interface SuperficieProps extends ViewProps {
  nivel?: NivelSuperficie;
  redondeo?: "xl" | "2xl" | "3xl";
  padding?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

const CLASES_NIVEL: Record<NivelSuperficie, string> = {
  "container-lowest": "bg-surface-container-lowest",
  "container-low": "bg-surface-container-low",
  container: "bg-surface-container",
  "container-high": "bg-surface-container-high",
  "container-highest": "bg-surface-container-highest",
};

const CLASES_REDONDEO: Record<NonNullable<SuperficieProps["redondeo"]>, string> = {
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
};

const CLASES_PADDING: Record<NonNullable<SuperficieProps["padding"]>, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

/**
 * Contenedor redondeado genérico (`rounded-* bg-surface-container*`) — reemplaza el
 * patrón repetido en el mockup de Stitch (`<div class="rounded-2xl bg-surface-container p-6">`).
 */
export function Superficie({
  nivel = "container",
  redondeo = "2xl",
  padding = "md",
  className,
  children,
  ...props
}: SuperficieProps & { className?: string }) {
  const clases = [CLASES_NIVEL[nivel], CLASES_REDONDEO[redondeo], CLASES_PADDING[padding], className]
    .filter(Boolean)
    .join(" ");

  return (
    <View className={clases} {...props}>
      {children}
    </View>
  );
}
