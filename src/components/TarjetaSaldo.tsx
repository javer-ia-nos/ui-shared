import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { formatearMoneda, enmascararCuenta } from "../utils";
import { Icono } from "./Icono";

export interface TarjetaSaldoProps {
  numeroCuenta: string;
  tipoCuenta: "AHORROS" | "CORRIENTE";
  saldoDisponible: number;
  moneda?: string;
}

/**
 * "Hero card" de saldo consolidado (mockup Stitch, Pantalla 1). Fase 1 usa un color
 * sólido de la paleta en vez del gradiente CSS del mockup (`bg-gradient-to-br`), que
 * NativeWind no traduce a `background-image` sobre `View` — ver plan de la Fase 1.
 */
export function TarjetaSaldo({
  numeroCuenta,
  tipoCuenta,
  saldoDisponible,
  moneda = "COP",
}: TarjetaSaldoProps) {
  const [oculto, setOculto] = useState(false);

  return (
    <View
      className="bg-surface-container-high rounded-3xl p-6"
      accessible={true}
      accessibilityRole="summary"
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
          {tipoCuenta === "AHORROS" ? "Cuenta de Ahorros" : "Cuenta Corriente"}
        </Text>
        <Text className="font-label-code text-label-code text-on-surface-variant">
          {enmascararCuenta(numeroCuenta)}
        </Text>
      </View>

      <Text className="font-body-sm text-body-sm text-on-surface-variant mb-1">Saldo disponible</Text>
      <View className="flex-row items-center gap-3">
        <Text className="font-label-numeric-lg text-headline-xl text-on-surface tracking-tight">
          {oculto ? "••••••••••••" : formatearMoneda(saldoDisponible, moneda)}
        </Text>
        <Pressable
          onPress={() => setOculto(!oculto)}
          accessibilityRole="button"
          accessibilityLabel={oculto ? "Mostrar saldo" : "Ocultar saldo"}
          className="p-1"
        >
          <Icono nombre={oculto ? "visibility_off" : "visibility"} color="#c4c6cf" />
        </Pressable>
      </View>
    </View>
  );
}
