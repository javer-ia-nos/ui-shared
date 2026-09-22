import React from "react";
import { View, Text, Pressable } from "react-native";
import { Icono } from "./Icono";
import type { NombreSimbolo } from "./simbolos";

export interface ItemNavegacionInferior {
  ruta: string;
  etiqueta: string;
  icono: NombreSimbolo;
}

export interface BarraNavegacionInferiorProps {
  items: ItemNavegacionInferior[];
  rutaActiva?: string;
  onNavegar?: (ruta: string) => void;
}

/**
 * Navegación inferior tipo tab bar (spec Stitch: nav fija "md:hidden" del
 * mockup). Pensada para móvil: reemplaza la fila horizontal con scroll de
 * EncabezadoApp (incómoda de tocar en pantallas angostas) por 4 pestañas
 * fijas, siempre visibles y sin necesidad de deslizar. Se renderiza como
 * hermano del contenido scrolleable (no dentro del ScrollView), para quedar
 * anclada abajo.
 */
export function BarraNavegacionInferior({ items, rutaActiva, onNavegar }: BarraNavegacionInferiorProps) {
  return (
    <View className="flex-row bg-surface-container-lowest border-t border-outline-variant/20 px-1 py-1.5">
      {items.map((item) => {
        const activo = item.ruta === rutaActiva;
        return (
          <Pressable
            key={item.ruta}
            onPress={() => onNavegar?.(item.ruta)}
            className={`flex-1 items-center gap-0.5 py-1.5 rounded-lg ${activo ? "bg-primary-container" : ""}`}
          >
            <Icono nombre={item.icono} tamaño={20} color={activo ? "#0b2545" : "#c4c6cf"} />
            <Text
              className={`font-body-sm text-[11px] ${activo ? "text-on-primary-container font-semibold" : "text-on-surface-variant"}`}
              numberOfLines={1}
            >
              {item.etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
