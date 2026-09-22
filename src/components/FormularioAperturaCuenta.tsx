import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { useAperturaCuenta, type Moneda, type TipoCuenta } from "../hooks/useAperturaCuenta";
import { formatearMoneda } from "../utils";

export interface FormularioAperturaCuentaProps {
  userId?: string;
  usuarioId?: string;
  apiBaseUrl?: string;
  token?: string;
  onAbierta?: () => void;
}

/** CU-06 / CU-07: apertura de cuentas corrientes o de ahorros contra ms-cuentas. */
export function FormularioAperturaCuenta({
  userId,
  usuarioId,
  apiBaseUrl,
  token,
  onAbierta,
}: FormularioAperturaCuentaProps) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const { cargando, error, cuentaCreada, aperturar, reset } = useAperturaCuenta({ apiBaseUrl, token });
  const [tipoCuenta, setTipoCuenta] = useState<TipoCuenta>("AHORROS");
  const [depositoInicial, setDepositoInicial] = useState("");
  const [alias, setAlias] = useState("");
  const [moneda, setMoneda] = useState<Moneda>("COP");

  const abrir = async () => {
    const ok = await aperturar(tipoCuenta, effectiveUserId, {
      depositoInicial: depositoInicial ? Number(depositoInicial) : undefined,
      moneda,
      alias: alias || undefined,
    });
    if (ok) {
      setDepositoInicial("");
      setAlias("");
      onAbierta?.();
    }
  };

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 w-full">
      <View className="flex-row items-center gap-2">
        <Icono nombre="add_circle" color="#b5c4ff" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">Abrir nueva cuenta</Text>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      {cuentaCreada && (
        <View className="bg-tertiary-container rounded-xl px-4 py-3 gap-2">
          <Text className="text-on-tertiary-container font-body-sm text-body-sm">
            Cuenta {cuentaCreada.accountNumber} abierta con saldo {formatearMoneda(cuentaCreada.balance)}.
          </Text>
          <BotonBancario titulo="Abrir otra cuenta" variante="secundario" onPress={reset} />
        </View>
      )}

      <View className="flex-row gap-2">
        {(["AHORROS", "CORRIENTE"] as TipoCuenta[]).map((tipo) => (
          <Pressable
            key={tipo}
            onPress={() => setTipoCuenta(tipo)}
            className={`flex-1 py-3 rounded-xl items-center ${
              tipoCuenta === tipo ? "bg-secondary-container" : "bg-surface-container-low"
            }`}
          >
            <Text
              className={`font-label-md text-label-md ${
                tipoCuenta === tipo ? "text-on-secondary-container" : "text-on-surface-variant"
              }`}
            >
              {tipo === "AHORROS" ? "Ahorros" : "Corriente"}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row gap-2">
        {(["COP", "USD"] as Moneda[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMoneda(m)}
            className={`flex-1 py-2 rounded-xl items-center ${
              moneda === m ? "bg-primary-container" : "bg-surface-container-low"
            }`}
          >
            <Text
              className={`font-label-sm text-label-sm ${
                moneda === m ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {m}
            </Text>
          </Pressable>
        ))}
      </View>

      <CampoTexto
        etiqueta="Alias (opcional)"
        placeholder="Mi cuenta principal"
        valor={alias}
        onCambio={setAlias}
      />

      <CampoTexto
        etiqueta="Depósito inicial (opcional)"
        placeholder="0"
        valor={depositoInicial}
        onCambio={setDepositoInicial}
        teclado="numeric"
      />

      <BotonBancario
        titulo={cargando ? "Abriendo..." : "Abrir cuenta"}
        onPress={abrir}
        disabled={cargando || !effectiveUserId}
      />
    </Superficie>
  );
}
