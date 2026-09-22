import React, { useState } from "react";
import { View, Text } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Icono } from "./Icono";
import { PastillaEstado } from "./PastillaEstado";
import { useResolverCuenta, type CuentaResuelta } from "../hooks/useResolverCuenta";
import { formatearMoneda, enmascararCuenta } from "../utils";

export interface SelectorCuentaProps {
  etiqueta?: string;
  placeholder?: string;
  apiBaseUrl?: string;
  token?: string;
  onResuelta: (cuenta: CuentaResuelta) => void;
}

/**
 * Reemplazo del "pega el UUID de la cuenta" por lo único que un usuario real
 * conoce: su número de cuenta. Lo resuelve contra ms-cuentas y solo entonces
 * expone el id interno al resto de la pantalla (`onResuelta`).
 */
export function SelectorCuenta({
  etiqueta = "Número de cuenta",
  placeholder = "5312 0044 7789",
  apiBaseUrl,
  token,
  onResuelta,
}: SelectorCuentaProps) {
  const { cuenta, resolviendo, error, resolver, limpiar } = useResolverCuenta({ apiBaseUrl, token });
  const [numero, setNumero] = useState("");

  const buscar = async () => {
    const encontrada = await resolver(numero);
    if (encontrada) onResuelta(encontrada);
  };

  const cambiar = () => {
    limpiar();
    setNumero("");
  };

  if (cuenta) {
    return (
      <View className="flex-row items-center justify-between p-3 bg-surface-container rounded-xl border border-outline-variant/30 gap-3">
        <View className="flex-row items-center gap-2 flex-1">
          <Icono nombre="account_balance" color="#8591b3" />
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-title-md text-title-md text-on-surface">
                {cuenta.alias || enmascararCuenta(cuenta.accountNumber)}
              </Text>
              <PastillaEstado texto={cuenta.accountType === "SAVINGS" ? "Ahorros" : "Corriente"} tono="secondary" />
            </View>
            <Text className="font-body-sm text-body-sm text-on-surface-variant">
              {enmascararCuenta(cuenta.accountNumber)} · {formatearMoneda(cuenta.balance, cuenta.currency)}
            </Text>
          </View>
        </View>
        <BotonBancario titulo="Cambiar" variante="secundario" onPress={cambiar} />
      </View>
    );
  }

  return (
    <View className="gap-2">
      <View className="flex-row items-end gap-2">
        <View className="flex-1">
          <CampoTexto etiqueta={etiqueta} valor={numero} onCambio={setNumero} placeholder={placeholder} teclado="numeric" />
        </View>
        <BotonBancario titulo={resolviendo ? "Buscando..." : "Buscar"} onPress={buscar} disabled={resolviendo || !numero} />
      </View>
      {error && <Text className="text-error font-body-sm text-body-sm">{error}</Text>}
    </View>
  );
}
