import React from "react";
import { View, Text } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { formatearMoneda, enmascararCuenta } from "../utils";
import type { CuentaResumen, BolsilloResumen } from "./PantallaInicioCuentas";

export interface AccountCardProps {
  /** Una cuenta (ahorros/corriente) o un bolsillo (subcuenta) — ambos comparten la misma tarjeta visual. */
  cuenta?: CuentaResumen;
  bolsillo?: BolsilloResumen;
}

/**
 * Tarjeta de cuenta/bolsillo individual (spec Stitch: "AccountCard", sección
 * "Cuentas & Bolsillos Activos"). Sin barra de progreso de meta para bolsillos:
 * ms-cuentas no expone un monto objetivo por subcuenta, así que no se inventa.
 */
export function AccountCard({ cuenta, bolsillo }: AccountCardProps) {
  if (bolsillo) {
    return (
      <Superficie nivel="container-high" redondeo="2xl" padding="lg" className="gap-2 lg:flex-1 lg:basis-1/3 lg:min-w-[220px]">
        <View className="flex-row items-center justify-between">
          <View className="p-2 rounded-lg bg-tertiary-container">
            <Icono nombre="school" color="#ffb955" />
          </View>
        </View>
        <Text className="font-headline-sm text-body-lg font-semibold text-on-surface mt-1">{bolsillo.nombre}</Text>
        <View className="mt-2">
          <Text className="font-label-caps text-label-caps uppercase text-on-surface-variant">Acumulado</Text>
          <Text className="font-label-numeric-lg text-headline-sm text-tertiary font-bold">
            {formatearMoneda(bolsillo.balance)}
          </Text>
        </View>
      </Superficie>
    );
  }

  if (!cuenta) return null;

  return (
    <Superficie nivel="container-high" redondeo="2xl" padding="lg" className="gap-4 lg:flex-1 lg:basis-1/3 lg:min-w-[220px]">
      <View className="flex-row items-start justify-between gap-4">
        <View className="p-2 rounded-lg bg-surface-container-highest">
          <Icono
            nombre={cuenta.tipoCuenta === "AHORROS" ? "account_balance_wallet" : "credit_card"}
            color="#b1c7f0"
          />
        </View>
        <View className="px-2 py-0.5 rounded-full bg-primary-container">
          <Text className="font-label-caps text-[10px] uppercase font-bold tracking-wider text-on-primary-container">
            {cuenta.etiquetaExtra || (cuenta.tipoCuenta === "AHORROS" ? "Ahorros" : "Corriente")}
          </Text>
        </View>
      </View>
      <View>
        <Text className="font-headline-sm text-body-lg font-semibold text-on-surface">{cuenta.titulo}</Text>
        <Text className="font-label-code text-label-code text-on-surface-variant">
          No. {enmascararCuenta(cuenta.numeroCuenta)}
        </Text>
      </View>
      <View>
        <Text className="font-label-caps text-label-caps uppercase text-on-surface-variant mb-1">Saldo Disponible</Text>
        <View className="flex-row items-baseline gap-1">
          <Text className="font-label-numeric-lg text-label-numeric-md font-bold text-on-surface">
            {formatearMoneda(cuenta.saldoDisponible)}
          </Text>
        </View>
      </View>
    </Superficie>
  );
}
