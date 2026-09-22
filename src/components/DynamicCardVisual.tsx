import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { BotonBancario } from "./BotonBancario";
import { CampoTexto } from "./CampoTexto";
import { formatearMoneda } from "../utils";
import type { Tarjeta } from "../hooks/useTarjetas";

export interface DynamicCardVisualProps {
  tarjeta: Tarjeta;
  cargando?: boolean;
  onBloquear: (motivo: string) => void;
  onDesbloquear: (motivo: string) => void;
}

/**
 * Visual de tarjeta (spec Stitch: "DynamicCardVisual", "Interactive Card
 * Showcase Module") con conmutador de bloqueo/desbloqueo real contra
 * ms-tarjetas (`POST /tarjetas/bloquear|desbloquear`). Sin CVV dinámico
 * (ms-tarjetas no lo expone) — el mockup lo pedía, pero no se fabrica.
 */
export function DynamicCardVisual({ tarjeta, cargando, onBloquear, onDesbloquear }: DynamicCardVisualProps) {
  const [motivo, setMotivo] = useState("");
  const [visible, setVisible] = useState(false);
  const bloqueada = tarjeta.isBlocked || tarjeta.status === "BLOQUEADA";
  const ultimosCuatro = tarjeta.cardNumber.slice(-4);

  return (
    <Superficie nivel="container-low" redondeo="3xl" padding="lg" className="gap-4 w-full">
      {/* Tarjeta física/virtual */}
      <View
        className={`w-full rounded-2xl p-5 gap-6 ${bloqueada ? "bg-surface-container-highest opacity-60" : "bg-surface-container-lowest"}`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-10 h-7 rounded bg-tertiary-fixed" />
            <Icono nombre="wifi" color="#b5c4ff" />
          </View>
          <View className="flex-row items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-highest">
            <View className="w-2 h-2 rounded-full bg-tertiary" />
            <Text className="font-headline-sm text-[11px] text-tertiary uppercase tracking-widest font-bold">
              {tarjeta.cardProduct}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="font-label-numeric-lg text-label-numeric-lg text-on-surface tracking-widest">
            {visible ? `•••• •••• •••• ${ultimosCuatro}` : "•••• •••• •••• ••••"}
          </Text>
          <Pressable onPress={() => setVisible((v) => !v)} className="p-1.5 rounded-full bg-surface-container/60">
            <Icono nombre={visible ? "visibility_off" : "visibility"} tamaño={18} />
          </Pressable>
        </View>

        <View className="flex-row items-end justify-between">
          <View>
            <Text className="font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant">
              Titular Acreditado
            </Text>
            <Text className="font-body-md text-body-md font-semibold text-on-surface uppercase">
              {tarjeta.cardType === "CREDITO" ? "Crédito" : "Débito"}
            </Text>
          </View>
          <View className="items-end">
            <Text className="font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant">Estado</Text>
            <Text className={`font-label-numeric-md text-label-numeric-md font-bold ${bloqueada ? "text-error" : "text-secondary"}`}>
              {bloqueada ? "Bloqueada" : "Activa"}
            </Text>
          </View>
        </View>
      </View>

      {/* Conmutador de bloqueo preventivo */}
      <View className="p-4 rounded-2xl bg-surface-container gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className={`w-10 h-10 rounded-xl items-center justify-center ${bloqueada ? "bg-error/15" : "bg-secondary/15"}`}>
              <Icono nombre={bloqueada ? "lock" : "lock_open"} color={bloqueada ? "#ffb4ab" : "#b5c4ff"} />
            </View>
            <View>
              <Text className="font-body-md text-body-md font-semibold text-on-surface">Bloqueo Preventivo</Text>
              <Text className={`font-body-sm text-body-sm ${bloqueada ? "text-error" : "text-[#10B981]"}`}>
                {bloqueada ? "Tarjeta Congelada" : "Tarjeta Activa y Segura"}
              </Text>
            </View>
          </View>
        </View>
        <CampoTexto
          etiqueta={bloqueada ? "Motivo del desbloqueo" : "Motivo del congelamiento"}
          valor={motivo}
          onCambio={setMotivo}
          placeholder="Ej. viaje, tarjeta extraviada, ya la encontré"
        />
        <BotonBancario
          titulo={cargando ? "Actualizando..." : bloqueada ? "Descongelar tarjeta" : "Congelar tarjeta temporalmente"}
          variante={bloqueada ? "primario" : "peligro"}
          disabled={cargando || motivo.trim().length < 3}
          onPress={() => (bloqueada ? onDesbloquear(motivo) : onBloquear(motivo))}
        />
      </View>

      {tarjeta.cardType === "CREDITO" && (
        <Text className="font-body-sm text-body-sm text-on-surface-variant">
          Cupo asignado en emisión: {formatearMoneda(tarjeta.creditLimit)}
        </Text>
      )}
    </Superficie>
  );
}
