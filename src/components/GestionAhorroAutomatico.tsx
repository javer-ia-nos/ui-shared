import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { PastillaEstado } from "./PastillaEstado";
import { useAhorroAutomatico, type FrecuenciaAhorro, type ReglaAhorroAutomatico } from "../hooks/useAhorroAutomatico";
import { formatearMoneda, formatearFecha } from "../utils";

export interface GestionAhorroAutomaticoProps {
  cuentaId?: string;
  apiBaseUrl?: string;
  token?: string;
}

const FRECUENCIAS: FrecuenciaAhorro[] = ["DIARIA", "SEMANAL", "MENSUAL"];

function TarjetaRegla({
  regla,
  onPausar,
  onEditar,
  onEliminar,
  cargando,
}: {
  regla: ReglaAhorroAutomatico;
  onPausar: () => void;
  onEditar: (monto: number) => void;
  onEliminar: () => void;
  cargando: boolean;
}) {
  const [monto, setMonto] = useState(String(regla.amount));

  return (
    <View className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 gap-3">
      <View className="flex-row items-center justify-between">
        <View>
          <View className="flex-row items-center gap-2">
            <Text className="font-title-md text-title-md text-on-surface">
              Bolsillo {regla.subAccountId.slice(0, 8)}…
            </Text>
            <PastillaEstado tono={regla.isActive ? "secondary" : "neutral"} texto={regla.isActive ? "Activa" : "Pausada"} />
          </View>
          <Text className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {formatearMoneda(regla.amount)} · {regla.frequency} · próxima: {formatearFecha(regla.nextRunDate)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <CampoTexto etiqueta="Nuevo monto" valor={monto} onCambio={setMonto} teclado="numeric" />
        </View>
        <BotonBancario
          titulo="Actualizar"
          variante="secundario"
          disabled={cargando || !monto}
          onPress={() => onEditar(Number(monto))}
        />
      </View>

      <View className="flex-row gap-2">
        <BotonBancario
          titulo={regla.isActive ? "Pausar" : "Reanudar"}
          variante="secundario"
          disabled={cargando}
          onPress={onPausar}
        />
        <BotonBancario titulo="Eliminar" variante="peligro" disabled={cargando} onPress={onEliminar} />
      </View>
    </View>
  );
}

/** CU-09: reglas de ahorro automático — crear, pausar/reanudar, modificar y eliminar. */
export function GestionAhorroAutomatico({ cuentaId, apiBaseUrl, token }: GestionAhorroAutomaticoProps) {
  const { reglas, cargando, error, cargar, crear, pausarReanudar, modificar, eliminar } = useAhorroAutomatico({
    cuentaId,
    apiBaseUrl,
    token,
  });

  const [subAccountId, setSubAccountId] = useState("");
  const [monto, setMonto] = useState("");
  const [frecuencia, setFrecuencia] = useState<FrecuenciaAhorro>("MENSUAL");

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuentaId]);

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-6 w-full">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icono nombre="trending_up" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">Ahorro automático (CU-09)</Text>
        </View>
        <BotonBancario
          titulo={cargando ? "Actualizando..." : "Refrescar"}
          variante="secundario"
          onPress={() => cargar()}
          disabled={cargando}
        />
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      {reglas.length === 0 && !cargando ? (
        <View className="py-8 items-center justify-center bg-surface-container/50 rounded-2xl">
          <Text className="text-on-surface-variant font-body-md text-body-md">
            Esta cuenta todavía no tiene reglas de ahorro automático.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {reglas.map((r) => (
            <TarjetaRegla
              key={r.id}
              regla={r}
              cargando={cargando}
              onPausar={() => pausarReanudar(r.id)}
              onEditar={(nuevoMonto) => modificar(r.id, { amount: nuevoMonto })}
              onEliminar={() => eliminar(r.id)}
            />
          ))}
        </View>
      )}

      <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-4">
        <Text className="font-title-md text-title-md text-on-surface">Crear nueva regla</Text>
        <CampoTexto
          etiqueta="Bolsillo destino (UUID de la subcuenta)"
          valor={subAccountId}
          onCambio={setSubAccountId}
          placeholder="00000000-0000-0000-0000-000000000003"
        />
        <CampoTexto
          etiqueta="Monto por ejecución"
          valor={monto}
          onCambio={setMonto}
          teclado="numeric"
          placeholder="10000"
        />
        <View className="gap-1.5">
          <Text className="font-body-sm text-body-sm text-on-surface-variant mb-1.5">Frecuencia</Text>
          <View className="flex-row gap-2">
            {FRECUENCIAS.map((f) => (
              <Pressable
                key={f}
                onPress={() => setFrecuencia(f)}
                className={`px-3 py-2 rounded-lg ${
                  frecuencia === f ? "bg-secondary-container" : "bg-surface-container-low"
                }`}
              >
                <Text
                  className={`font-body-sm text-body-sm ${
                    frecuencia === f ? "text-on-secondary-container font-medium" : "text-on-surface-variant"
                  }`}
                >
                  {f}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <BotonBancario
          titulo={cargando ? "Creando..." : "Crear regla"}
          disabled={cargando || !subAccountId || !monto}
          onPress={() => {
            crear({ subAccountId, amount: Number(monto), frequency: frecuencia });
            setSubAccountId("");
            setMonto("");
          }}
        />
      </Superficie>
    </Superficie>
  );
}
