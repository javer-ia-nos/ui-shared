import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { useLimites } from "../hooks/useLimites";
import { formatearMoneda } from "../utils";

export interface FormularioLimitesProps {
  usuarioId: string;
  apiBaseUrl?: string;
  token?: string;
}

/** CU-19: topes y límites diarios / por operación. */
export function FormularioLimites({ usuarioId, apiBaseUrl, token }: FormularioLimitesProps) {
  const { limites, cargando, error, cargar, actualizar } = useLimites({ usuarioId, apiBaseUrl, token });
  const [limiteDiario, setLimiteDiario] = useState("");
  const [limitePorOperacion, setLimitePorOperacion] = useState("");
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId]);

  useEffect(() => {
    if (limites) {
      setLimiteDiario(String(limites.limiteDiario));
      setLimitePorOperacion(String(limites.limitePorOperacion));
    }
  }, [limites]);

  const guardar = async () => {
    setGuardado(false);
    const ok = await actualizar(Number(limiteDiario), Number(limitePorOperacion));
    if (ok) setGuardado(true);
  };

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 w-full">
      <View className="flex-row items-center gap-2">
        <Icono nombre="tune" color="#b5c4ff" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">Topes y límites (CU-19)</Text>
      </View>

      {limites && (
        <Text className="font-body-sm text-body-sm text-on-surface-variant">
          Vigentes: {formatearMoneda(limites.limiteDiario)} diario ·{" "}
          {formatearMoneda(limites.limitePorOperacion)} por operación
        </Text>
      )}

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}
      {guardado && !error && (
        <View className="bg-secondary-container/20 rounded-xl px-4 py-3">
          <Text className="text-secondary font-body-sm text-body-sm">Límites actualizados correctamente.</Text>
        </View>
      )}

      <CampoTexto
        etiqueta="Límite diario (COP)"
        valor={limiteDiario}
        onCambio={setLimiteDiario}
        teclado="numeric"
      />
      <CampoTexto
        etiqueta="Límite por operación (COP)"
        valor={limitePorOperacion}
        onCambio={setLimitePorOperacion}
        teclado="numeric"
      />

      <BotonBancario titulo={cargando ? "Guardando..." : "Guardar límites"} onPress={guardar} disabled={cargando} />
    </Superficie>
  );
}
