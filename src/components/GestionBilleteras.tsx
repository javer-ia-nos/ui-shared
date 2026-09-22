import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Superficie } from "./Superficie";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Icono } from "./Icono";
import { PastillaEstado } from "./PastillaEstado";
import { useBilleteras, type UseBilleterasOptions } from "../hooks/useBilleteras";
import { formatearFecha } from "../utils";

export interface GestionBilleterasProps extends UseBilleterasOptions {}

const OPCIONES_BILLETERA: Array<"APPLE_PAY" | "GOOGLE_WALLET"> = ["APPLE_PAY", "GOOGLE_WALLET"];

/** CU-29: soporte para billeteras externas (Apple Pay / Google Wallet), vía ms-transacciones. */
export function GestionBilleteras({ userId, usuarioId, apiBaseUrl, token }: GestionBilleterasProps) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const { billeteras, cargando, error, cargar, vincular, desvincular } = useBilleteras({
    userId: effectiveUserId,
    apiBaseUrl,
    token,
  });

  // La tarjeta se identifica por su UUID: ms-tarjetas no es alcanzable desde el
  // frontend (el api-gateway no lo enruta), así que el usuario pega el UUID de
  // una tarjeta que ya conoce en vez de elegirla de una lista resuelta en vivo.
  const [tarjetaId, setTarjetaId] = useState("");
  const [billeteraSeleccionada, setBilleteraSeleccionada] = useState<"APPLE_PAY" | "GOOGLE_WALLET">("APPLE_PAY");
  const [tokenDispositivo, setTokenDispositivo] = useState("");

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  const vincularBilletera = async () => {
    if (!tarjetaId || !tokenDispositivo) return;
    const ok = await vincular(tarjetaId, billeteraSeleccionada, tokenDispositivo);
    if (ok) {
      setTarjetaId("");
      setTokenDispositivo("");
    }
  };

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-6 w-full">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <Icono nombre="smartphone" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">Billeteras vinculadas (CU-29)</Text>
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

      {billeteras.length === 0 && !cargando ? (
        <View className="py-8 items-center justify-center bg-surface-container/50 rounded-2xl">
          <Text className="text-on-surface-variant font-body-md text-body-md">
            Este usuario todavía no tiene billeteras digitales vinculadas.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {billeteras.map((b) => (
            <View
              key={b.id}
              className="flex-row flex-wrap items-center justify-between gap-3 p-4 bg-surface-container rounded-2xl border border-outline-variant/30"
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-title-md text-title-md text-on-surface">
                    {b.billetera === "APPLE_PAY" ? "Apple Pay" : "Google Wallet"}
                  </Text>
                  <PastillaEstado texto={b.estado} tono={b.estado === "ACTIVA" ? "secondary" : "neutral"} />
                </View>
                <Text className="font-body-sm text-body-sm text-on-surface-variant font-mono">
                  Tarjeta: {b.tarjetaId.slice(0, 8)}...
                </Text>
                <Text className="font-label-sm text-label-sm text-on-surface-variant/80 mt-1">
                  Vinculada el {formatearFecha(b.fechaVinculacion)}
                </Text>
              </View>
              <BotonBancario titulo="Desvincular" variante="peligro" onPress={() => desvincular(b.id)} />
            </View>
          ))}
        </View>
      )}

      <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-4 mt-2">
        <Text className="font-title-md text-title-md text-on-surface">Vincular una nueva billetera</Text>

        <View className="flex-row flex-wrap gap-2">
          {OPCIONES_BILLETERA.map((opcion) => (
            <BotonBancario
              key={opcion}
              titulo={opcion === "APPLE_PAY" ? "Apple Pay" : "Google Wallet"}
              variante={billeteraSeleccionada === opcion ? "primario" : "secundario"}
              onPress={() => setBilleteraSeleccionada(opcion)}
            />
          ))}
        </View>

        <CampoTexto
          etiqueta="UUID de la tarjeta a vincular"
          placeholder="00000000-0000-0000-0000-000000000003"
          valor={tarjetaId}
          onCambio={setTarjetaId}
        />
        <CampoTexto
          etiqueta="Token del dispositivo"
          placeholder="Token entregado por el SDK de la billetera"
          valor={tokenDispositivo}
          onCambio={setTokenDispositivo}
        />

        <BotonBancario
          titulo={cargando ? "Vinculando..." : "Vincular billetera"}
          onPress={vincularBilletera}
          disabled={cargando}
        />
      </Superficie>
    </Superficie>
  );
}
