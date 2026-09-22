import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { PastillaEstado } from "./PastillaEstado";
import { useAhorroAutomatico, type FrecuenciaAhorro, type ReglaAhorroAutomatico } from "../hooks/useAhorroAutomatico";
import { useBolsillos, type Subcuenta } from "../hooks/useBolsillos";
import { formatearMoneda, formatearFecha } from "../utils";

export interface GestionAhorroAutomaticoProps {
  cuentaId?: string;
  apiBaseUrl?: string;
  token?: string;
}

const FRECUENCIAS: FrecuenciaAhorro[] = ["DIARIA", "SEMANAL", "MENSUAL"];

function TarjetaRegla({
  regla,
  nombreBolsillo,
  onPausar,
  onEditar,
  onEliminar,
  cargando,
}: {
  regla: ReglaAhorroAutomatico;
  nombreBolsillo: string;
  onPausar: () => void;
  onEditar: (monto: number) => void;
  onEliminar: () => void;
  cargando: boolean;
}) {
  const [monto, setMonto] = useState(String(regla.amount));

  return (
    <View className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 gap-3">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="flex-1 min-w-[160px]">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="font-title-md text-title-md text-on-surface">Bolsillo {nombreBolsillo}</Text>
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

      <View className="flex-row flex-wrap gap-2">
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
  // Los bolsillos son de la misma cuenta — se cargan acá solo para poder
  // elegirlos por nombre en vez de pedirle al usuario el UUID de la subcuenta.
  const { subcuentas: bolsillos, cargar: cargarBolsillos } = useBolsillos({ cuentaId, apiBaseUrl, token });

  const [subAccountId, setSubAccountId] = useState("");
  const [monto, setMonto] = useState("");
  const [frecuencia, setFrecuencia] = useState<FrecuenciaAhorro>("MENSUAL");

  useEffect(() => {
    cargar();
    cargarBolsillos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuentaId]);

  const nombreDeBolsillo = (id: string) => bolsillos.find((b) => b.id === id)?.name ?? `${id.slice(0, 8)}…`;

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-6 w-full">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
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
              nombreBolsillo={nombreDeBolsillo(r.subAccountId)}
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
        {bolsillos.length === 0 ? (
          <Text className="font-body-sm text-body-sm text-on-surface-variant">
            Esta cuenta todavía no tiene bolsillos — crea uno arriba antes de programar un ahorro automático.
          </Text>
        ) : (
          <View className="gap-1.5">
            <Text className="font-body-sm text-body-sm text-on-surface-variant mb-1.5">Bolsillo destino</Text>
            <View className="flex-row flex-wrap gap-2">
              {bolsillos.map((b: Subcuenta) => (
                <Pressable
                  key={b.id}
                  onPress={() => setSubAccountId(b.id)}
                  className={`px-3 py-2 rounded-lg ${
                    subAccountId === b.id ? "bg-secondary-container" : "bg-surface-container-low"
                  }`}
                >
                  <Text
                    className={`font-body-sm text-body-sm ${
                      subAccountId === b.id ? "text-on-secondary-container font-medium" : "text-on-surface-variant"
                    }`}
                  >
                    {b.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        <CampoTexto
          etiqueta="Monto por ejecución"
          valor={monto}
          onCambio={setMonto}
          teclado="numeric"
          placeholder="10000"
        />
        <View className="gap-1.5">
          <Text className="font-body-sm text-body-sm text-on-surface-variant mb-1.5">Frecuencia</Text>
          <View className="flex-row flex-wrap gap-2">
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
