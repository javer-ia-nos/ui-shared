import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { useLimites } from "../hooks/useLimites";
import { formatearMoneda } from "../utils";

export interface FormularioLimitesProps {
  userId?: string;
  usuarioId?: string;
  apiBaseUrl?: string;
  token?: string;
}

/** CU-19: topes y límites diarios / por operación. */
export function FormularioLimites({
  userId,
  usuarioId,
  apiBaseUrl,
  token,
}: FormularioLimitesProps) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const { limites, cargando, error, cargar, actualizar } = useLimites({
    userId: effectiveUserId,
    apiBaseUrl,
    token,
  });
  const [limiteDiario, setLimiteDiario] = useState("");
  const [limitePorOperacion, setLimitePorOperacion] = useState("");
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  useEffect(() => {
    if (limites) {
      setLimiteDiario(String(limites.limiteDiario));
      setLimitePorOperacion(String(limites.limitePorOperacion));
    }
  }, [limites]);

  const guardar = async () => {
    const diario = Number(limiteDiario);
    const op = Number(limitePorOperacion);
    if (!diario || !op) return;
    const ok = await actualizar(diario, op);
    if (ok) {
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    }
  };

  return (
    <Superficie
      nivel="container"
      redondeo="3xl"
      padding="lg"
      className="gap-6 w-full"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icono nombre="tune" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">
            Límites transaccionales (CU-19)
          </Text>
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
          <Text className="text-on-error-container font-body-sm text-body-sm">
            {error}
          </Text>
        </View>
      )}

      {guardado && (
        <View className="bg-tertiary-container rounded-xl px-4 py-3">
          <Text className="text-on-tertiary-container font-body-sm text-body-sm">
            Límites actualizados correctamente y reflejados en el sistema.
          </Text>
        </View>
      )}

      {limites && (
        <View className="flex-row gap-4">
          <View className="flex-1 p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
            <Text className="text-on-surface-variant font-label-md text-label-md">
              Límite diario vigente
            </Text>
            <Text className="font-headline-sm text-headline-sm text-primary mt-1">
              {formatearMoneda(limites.limiteDiario)}
            </Text>
          </View>
          <View className="flex-1 p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
            <Text className="text-on-surface-variant font-label-md text-label-md">
              Por operación vigente
            </Text>
            <Text className="font-headline-sm text-headline-sm text-secondary mt-1">
              {formatearMoneda(limites.limitePorOperacion)}
            </Text>
          </View>
        </View>
      )}

      <Superficie
        nivel="container-low"
        redondeo="2xl"
        padding="md"
        className="gap-4"
      >
        <Text className="font-title-md text-title-md text-on-surface">
          Modificar topes transaccionales
        </Text>
        <CampoTexto
          etiqueta="Nuevo límite diario"
          valor={limiteDiario}
          onCambio={setLimiteDiario}
          teclado="numeric"
          placeholder="5000000"
        />
        <CampoTexto
          etiqueta="Nuevo límite por operación"
          valor={limitePorOperacion}
          onCambio={setLimitePorOperacion}
          teclado="numeric"
          placeholder="3000000"
        />
        <BotonBancario
          titulo={cargando ? "Guardando..." : "Guardar nuevos límites"}
          onPress={guardar}
          disabled={cargando}
        />
      </Superficie>
    </Superficie>
  );
}
