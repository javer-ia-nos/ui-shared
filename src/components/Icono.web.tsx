import React from "react";
import { Text } from "react-native";
import type { NombreSimbolo } from "./simbolos";

export interface IconoProps {
  nombre: NombreSimbolo;
  tamaño?: number;
  color?: string;
}

/**
 * Variante web de <Icono />: usa el webfont real "Material Symbols Outlined" (el
 * mismo que ya carga ui-shared/plantilla.html vía Google Fonts) en vez de
 * @expo/vector-icons — evita arrastrar todo el registro de assets nativo de RN
 * (Flow syntax, expo-font) a un bundle que corre en el navegador. El nombre del
 * símbolo se usa tal cual como texto: la fuente lo renderiza como ícono por
 * ligadura tipográfica. El `<link>` de la fuente se carga una vez en
 * `LayoutPrincipal.astro`.
 */
export function Icono({ nombre, tamaño = 20, color = "#c4c6cf" }: IconoProps) {
  return (
    <Text
      style={{
        fontFamily: "Material Symbols Outlined",
        fontSize: tamaño,
        lineHeight: tamaño,
        color,
      }}
    >
      {nombre}
    </Text>
  );
}
