import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { PastillaEstado } from "./PastillaEstado";
import { usePagosProgramados, type UsePagosProgramadosOptions, type FrecuenciaPago } from "../hooks/usePagosProgramados";
import { formatearMoneda, formatearFecha } from "../utils";

export interface GestionPagosProgramadosProps extends UsePagosProgramadosOptions {
  cuentaOrigen: string;
}

const FRECUENCIAS: FrecuenciaPago[] = ["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"];
const ETIQUETA_FRECUENCIA: Record<FrecuenciaPago, string> = {
  DAILY: "Diaria",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
};

/** CU-24: administración de pagos automáticos/programados, contra ms-transacciones. */
export function GestionPagosProgramados({ cuentaOrigen, apiBaseUrl, token }: GestionPagosProgramadosProps) {
  const { pagos, cargando, error, cargar, programar, alternarEstado, cancelar } = usePagosProgramados({
    cuentaOrigen,
    apiBaseUrl,
    token,
  });

  const [monto, setMonto] = useState("");
  const [frecuencia, setFrecuencia] = useState<FrecuenciaPago>("MONTHLY");
  const [proximaEjecucion, setProximaEjecucion] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuentaOrigen]);

  const crear = async () => {
    const valorNumerico = Number(monto);
    if (!valorNumerico || !proximaEjecucion) return;
    const isoFecha = /T/.test(proximaEjecucion) ? proximaEjecucion : `${proximaEjecucion}T00:00:00.000Z`;
    const ok = await programar(valorNumerico, frecuencia, isoFecha, descripcion || undefined);
    if (ok) {
      setMonto("");
      setProximaEjecucion("");
      setDescripcion("");
    }
  };

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-6 w-full">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icono nombre="event_repeat" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">Pagos automáticos (CU-24)</Text>
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

      {pagos.length === 0 && !cargando ? (
        <View className="py-8 items-center justify-center bg-surface-container/50 rounded-2xl">
          <Text className="text-on-surface-variant font-body-md text-body-md">
            Esta cuenta todavía no tiene pagos automáticos programados.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {pagos.map((p) => (
            <View
              key={p.id}
              className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 gap-2"
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-title-md text-title-md text-on-surface">
                  {formatearMoneda(p.monto)} · {ETIQUETA_FRECUENCIA[p.frecuencia as FrecuenciaPago] ?? p.frecuencia}
                </Text>
                <PastillaEstado tono={p.activo ? "secondary" : "neutral"} texto={p.activo ? "Activo" : "Pausado"} />
              </View>
              <Text className="font-body-sm text-body-sm text-on-surface-variant">
                Próxima ejecución: {formatearFecha(p.proximaEjecucion)}
              </Text>
              <View className="flex-row gap-2 mt-1">
                <BotonBancario
                  titulo={p.activo ? "Pausar" : "Reanudar"}
                  variante="secundario"
                  onPress={() => alternarEstado(p.id, !p.activo)}
                  disabled={cargando}
                />
                <BotonBancario
                  titulo="Cancelar"
                  variante="peligro"
                  onPress={() => cancelar(p.id)}
                  disabled={cargando}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-4">
        <Text className="font-title-md text-title-md text-on-surface">Programar nuevo pago</Text>
        <CampoTexto etiqueta="Monto" valor={monto} onCambio={setMonto} teclado="numeric" placeholder="150000" />
        <View className="gap-1.5">
          <Text className="font-body-sm text-body-sm text-on-surface-variant mb-1">Frecuencia</Text>
          <View className="flex-row flex-wrap gap-2">
            {FRECUENCIAS.map((f) => (
              <Pressable
                key={f}
                onPress={() => setFrecuencia(f)}
                className={`px-3 py-2 rounded-xl ${f === frecuencia ? "bg-primary-container" : "bg-surface-container-high"}`}
              >
                <Text
                  className={`font-label-md text-label-md ${f === frecuencia ? "text-on-primary-container" : "text-on-surface-variant"}`}
                >
                  {ETIQUETA_FRECUENCIA[f]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <CampoTexto
          etiqueta="Fecha de la próxima ejecución (AAAA-MM-DD)"
          valor={proximaEjecucion}
          onCambio={setProximaEjecucion}
          placeholder="2026-10-01"
        />
        <CampoTexto
          etiqueta="Descripción (opcional)"
          valor={descripcion}
          onCambio={setDescripcion}
          placeholder="Cuota administración"
        />
        <BotonBancario titulo={cargando ? "Guardando..." : "Programar pago"} onPress={crear} disabled={cargando} />
      </Superficie>
    </Superficie>
  );
}
