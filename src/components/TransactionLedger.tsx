import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Icono } from "./Icono";
import { formatearMoneda, formatearFecha } from "../utils";
import type { MovimientoResumen } from "./PantallaInicioCuentas";

export interface TransactionLedgerProps {
  movimientos: MovimientoResumen[];
}

type Filtro = "TODOS" | "INGRESOS" | "EGRESOS";

/**
 * Registro de actividad (spec Stitch: "TransactionLedger", sección
 * "Movimientos Recientes") con filtros por tipo. Solo se ofrecen los filtros
 * que la data real puede distinguir (ingreso/egreso) — el mockup incluía un
 * filtro "Bolsillos" que no corresponde a ningún campo real del movimiento,
 * así que se omite en vez de fingir esa categoría.
 */
export function TransactionLedger({ movimientos }: TransactionLedgerProps) {
  const [filtro, setFiltro] = useState<Filtro>("TODOS");

  const filtrados = useMemo(() => {
    if (filtro === "INGRESOS") return movimientos.filter((m) => m.esIngreso);
    if (filtro === "EGRESOS") return movimientos.filter((m) => !m.esIngreso);
    return movimientos;
  }, [movimientos, filtro]);

  if (movimientos.length === 0) return null;

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap gap-1 p-1 rounded-xl bg-surface-container-high self-start">
        {(
          [
            ["TODOS", "Todos"],
            ["INGRESOS", "Ingresos"],
            ["EGRESOS", "Egresos"],
          ] as Array<[Filtro, string]>
        ).map(([valor, etiqueta]) => (
          <Pressable
            key={valor}
            onPress={() => setFiltro(valor)}
            className={`px-3 py-1 rounded-lg ${filtro === valor ? "bg-secondary-container" : ""}`}
          >
            <Text
              className={`font-body-sm text-body-sm ${
                filtro === valor ? "text-on-secondary-container font-semibold" : "text-on-surface-variant"
              }`}
            >
              {etiqueta}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="gap-1">
        {filtrados.map((mov) => (
          <View
            key={mov.id}
            className="flex-row flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-high/60"
          >
            <View className="flex-row items-center gap-3 flex-1 min-w-[200px]">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  mov.esIngreso ? "bg-[#10B981]/20" : "bg-error-container/40"
                }`}
              >
                <Icono nombre={mov.esIngreso ? "swap_horiz" : "account_balance"} color={mov.esIngreso ? "#10B981" : "#ffb4ab"} />
              </View>
              <View className="flex-1">
                <Text className="font-body-md font-semibold text-on-surface" numberOfLines={1}>
                  {mov.titulo}
                </Text>
                <Text className="font-body-sm text-body-sm text-on-surface-variant" numberOfLines={1}>
                  {mov.detalle}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text
                className={`font-label-numeric-md font-semibold ${mov.esIngreso ? "text-[#10B981]" : "text-on-surface"}`}
              >
                {mov.esIngreso ? "+" : "-"} {formatearMoneda(mov.monto)}
              </Text>
              <Text className="font-body-sm text-body-sm text-on-surface-variant">{formatearFecha(mov.fecha)}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
