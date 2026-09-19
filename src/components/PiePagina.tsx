import React from "react";
import { View, Text } from "react-native";
import { Icono } from "./Icono";

/**
 * Footer estático (Web y Móvil) con los badges legales del mockup de Stitch. Sin
 * lógica ni props: es contenido institucional fijo.
 */
export function PiePagina() {
  return (
    <View className="bg-surface-container-lowest px-6 py-6 gap-4">
      <View className="flex-row items-center gap-2">
        <Icono nombre="account_balance" color="#b1c7f0" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">
          Pontificia Universidad Javeriana
        </Text>
      </View>
      <Text className="font-body-sm text-body-sm text-on-surface-variant">
        Vigilado Superintendencia Financiera de Colombia. Seguro de depósitos FOGAFÍN.
      </Text>
      <View className="flex-row flex-wrap items-center gap-3">
        <View className="bg-surface-container px-3 py-1.5 rounded-md">
          <Text className="font-label-caps text-label-caps text-on-surface-variant uppercase">
            Superfinanciera
          </Text>
        </View>
        <View className="bg-surface-container px-3 py-1.5 rounded-md">
          <Text className="font-label-caps text-label-caps text-on-surface-variant uppercase">
            Fogafín Protegido
          </Text>
        </View>
        <View className="bg-surface-container px-3 py-1.5 rounded-md">
          <Text className="font-label-caps text-label-caps text-secondary uppercase">
            Javer-IA Token 2FA
          </Text>
        </View>
      </View>
      <Text className="font-body-sm text-body-sm text-outline">
        © 2026 Javer-IA-nos Banca Digital. Arquitectura C4 Cloud Native.
      </Text>
    </View>
  );
}
