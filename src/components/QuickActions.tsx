import React from "react";
import { View, Text, Pressable } from "react-native";
import { Icono } from "./Icono";
import type { NombreSimbolo } from "./simbolos";

export type AccionRapida = "transferir" | "pagar-factura" | "qr" | "certificado";

export interface QuickActionsProps {
  onAccion: (accion: AccionRapida) => void;
  /** Deshabilita la acción "certificado" mientras no haya cuentas (igual que el botón original). */
  certificadoDeshabilitado?: boolean;
}

const ITEMS: Array<{
  accion: AccionRapida;
  etiqueta: string;
  subtitulo: string;
  icono: NombreSimbolo;
  fondo: string;
  color: string;
}> = [
  { accion: "transferir", etiqueta: "Transferir", subtitulo: "Transfiya & Cuentas", icono: "swap_horiz", fondo: "bg-secondary-container", color: "#e3e7ff" },
  { accion: "pagar-factura", etiqueta: "Pagar Servicios", subtitulo: "Matrícula & Convenios", icono: "receipt_long", fondo: "bg-primary-container", color: "#b1c7f0" },
  { accion: "qr", etiqueta: "Código QR", subtitulo: "Redeban & Comercios", icono: "qr_code_scanner", fondo: "bg-surface-bright", color: "#ffb955" },
  { accion: "certificado", etiqueta: "Certificados", subtitulo: "Descarga oficial PDF", icono: "verified", fondo: "bg-surface-container-highest", color: "#b5c4ff" },
];

/**
 * Accesos rápidos universales (spec Stitch, sección "SECTION 2: QUICK
 * UNIVERSAL ACTIONS"): Transferir, Pagar Servicios, Código QR, Certificados.
 * No conoce el router de la app anfitriona: solo emite `onAccion`.
 */
export function QuickActions({ onAccion, certificadoDeshabilitado }: QuickActionsProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {ITEMS.map((item) => {
        const deshabilitado = item.accion === "certificado" && certificadoDeshabilitado;
        return (
          <Pressable
            key={item.accion}
            onPress={() => !deshabilitado && onAccion(item.accion)}
            disabled={deshabilitado}
            className={`flex-1 basis-[45%] sm:basis-[22%] min-w-[140px] flex-row items-center gap-3 p-4 rounded-xl bg-surface-container active:opacity-80 ${
              deshabilitado ? "opacity-40" : ""
            }`}
          >
            <View className={`p-3 rounded-xl items-center justify-center ${item.fondo}`}>
              <Icono nombre={item.icono} tamaño={24} color={item.color} />
            </View>
            <View className="flex-1 min-w-0">
              <Text className="font-headline-sm text-body-lg font-semibold text-on-surface" numberOfLines={1}>
                {item.etiqueta}
              </Text>
              <Text className="font-body-sm text-body-sm text-on-surface-variant" numberOfLines={1}>
                {item.subtitulo}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
