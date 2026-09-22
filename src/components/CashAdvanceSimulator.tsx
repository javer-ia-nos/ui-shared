import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";

export interface CashAdvanceSimulatorProps {
  tarjetaId: string;
  cargando?: boolean;
  onSimular: (monto: number, cuotas: number) => Promise<{ exito: boolean; transaccionId: string } | null>;
}

const PLAZOS = [6, 12, 24, 36];

/**
 * Simulador de avance a cuotas (spec Stitch: "Avance Express") contra
 * `POST /tarjetas/avance` real. ms-tarjetas no devuelve tasa efectiva
 * (E.A./M.V.) en la respuesta, así que este componente no la inventa: solo
 * muestra el desglose de cuotas que el propio usuario pidió (sin intereses,
 * porque no hay tasa real con la que calcularlos) y el resultado real de la
 * operación.
 */
export function CashAdvanceSimulator({ tarjetaId, cargando, onSimular }: CashAdvanceSimulatorProps) {
  const [monto, setMonto] = useState("");
  const [cuotas, setCuotas] = useState(12);
  const [resultado, setResultado] = useState<{ exito: boolean; transaccionId: string } | null>(null);

  const montoNumerico = Number(monto);
  const valorCuota = montoNumerico > 0 && cuotas > 0 ? Math.ceil(montoNumerico / cuotas) : 0;

  const simular = async () => {
    if (!tarjetaId || montoNumerico < 10000 || cuotas < 1) return;
    const res = await onSimular(montoNumerico, cuotas);
    setResultado(res);
  };

  return (
    <Superficie nivel="container-low" redondeo="3xl" padding="lg" className="gap-4 w-full">
      <View className="flex-row items-center justify-between">
        <Text className="font-headline-sm text-headline-sm text-on-surface">Avance Express</Text>
        <Icono nombre="bolt" color="#ffb955" />
      </View>
      <Text className="font-body-sm text-body-sm text-on-surface-variant -mt-2">
        Desembolso inmediato a tu cuenta, contra el cupo real disponible de esta tarjeta.
      </Text>

      {resultado && (
        <Superficie nivel="container" redondeo="2xl" padding="md" className="gap-2">
          <Text className="font-body-sm text-body-sm text-on-tertiary-container">
            {resultado.exito ? "Avance registrado" : "No se pudo registrar el avance"}
          </Text>
          {resultado.transaccionId && (
            <Text className="font-label-code text-body-sm text-on-surface-variant">
              Transacción: {resultado.transaccionId}
            </Text>
          )}
        </Superficie>
      )}

      <CampoTexto etiqueta="Monto del avance (mín. $10.000)" valor={monto} onCambio={setMonto} teclado="numeric" />

      <View className="gap-2">
        <Text className="font-label-caps text-label-caps uppercase text-on-surface-variant">Plazo en cuotas</Text>
        <View className="flex-row gap-2">
          {PLAZOS.map((p) => (
            <Pressable
              key={p}
              onPress={() => setCuotas(p)}
              className={`flex-1 py-2 rounded-xl items-center ${cuotas === p ? "bg-secondary-container" : "bg-surface-container"}`}
            >
              <Text
                className={`font-label-code text-body-sm font-semibold ${
                  cuotas === p ? "text-on-secondary-container" : "text-on-surface"
                }`}
              >
                {p}m
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {valorCuota > 0 && (
        <Superficie nivel="container" redondeo="2xl" padding="md" className="gap-1">
          <View className="flex-row justify-between">
            <Text className="font-body-sm text-body-sm text-on-surface-variant">Valor aproximado por cuota</Text>
            <Text className="font-label-numeric-md text-label-numeric-md text-tertiary font-bold">{valorCuota}</Text>
          </View>
          <Text className="font-body-sm text-[11px] text-on-surface-variant">
            Estimado sin intereses: ms-tarjetas no informa tasa efectiva por avance.
          </Text>
        </Superficie>
      )}

      <BotonBancario
        titulo={cargando ? "Procesando..." : "Simular y Desembolsar"}
        onPress={simular}
        disabled={cargando || !tarjetaId || montoNumerico < 10000 || cuotas < 1 || cuotas > 36}
      />
    </Superficie>
  );
}
