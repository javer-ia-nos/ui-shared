import React from "react";
import { View, Text, Pressable } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { SelectorCuenta } from "./SelectorCuenta";
import { usePagoPresencial, type UsePagoPresencialOptions, type TipoOperacionPresencial } from "../hooks/usePagoPresencial";

export interface FormularioPagoPresencialProps extends UsePagoPresencialOptions {}

const TIPOS: { valor: TipoOperacionPresencial; etiqueta: string }[] = [
  { valor: "CASH_DEPOSIT", etiqueta: "Depósito en efectivo" },
  { valor: "CHECK_DEPOSIT", etiqueta: "Depósito con cheque" },
  { valor: "CASH_WITHDRAWAL", etiqueta: "Retiro en efectivo" },
];

/** CU-28: registro de depósitos/retiros presenciales en ventanilla, contra ms-transacciones. */
export function FormularioPagoPresencial({ cuentaId, apiBaseUrl, token, onSuccess, onError }: FormularioPagoPresencialProps) {
  const {
    cuentaId: cuenta,
    setCuentaId,
    tipoOperacion,
    setTipoOperacion,
    monto,
    setMonto,
    sucursalId,
    setSucursalId,
    cajeroId,
    setCajeroId,
    numeroCheque,
    setNumeroCheque,
    bancoCheque,
    setBancoCheque,
    descripcion,
    setDescripcion,
    cargando,
    error,
    resultado,
    registrar,
    reset,
  } = usePagoPresencial({ cuentaId, apiBaseUrl, token, onSuccess, onError });

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 max-w-md w-full">
      <View className="flex-row items-center gap-2 mb-2">
        <Icono nombre="payments" color="#b5c4ff" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">Operación en ventanilla (CU-28)</Text>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      {resultado && (
        <View className="bg-tertiary-container rounded-xl px-4 py-3 gap-2">
          <Text className="text-on-tertiary-container font-body-sm text-body-sm">
            {resultado.mensaje || "¡Operación registrada!"} · Comprobante {resultado.numeroComprobante}
          </Text>
          <BotonBancario titulo="Registrar otra operación" variante="secundario" onPress={reset} />
        </View>
      )}

      <View className="gap-1.5">
        <Text className="font-body-sm text-body-sm text-on-surface-variant mb-1">Tipo de operación</Text>
        <View className="flex-row flex-wrap gap-2">
          {TIPOS.map((t) => (
            <Pressable
              key={t.valor}
              onPress={() => setTipoOperacion(t.valor)}
              className={`px-3 py-2 rounded-xl ${
                t.valor === tipoOperacion ? "bg-primary-container" : "bg-surface-container-high"
              }`}
            >
              <Text
                className={`font-label-md text-label-md ${
                  t.valor === tipoOperacion ? "text-on-primary-container" : "text-on-surface-variant"
                }`}
              >
                {t.etiqueta}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <SelectorCuenta etiqueta="Cuenta" token={token} onResuelta={(c) => setCuentaId(c.id)} />
      <CampoTexto etiqueta="Monto" placeholder="200000" valor={monto} onCambio={setMonto} teclado="numeric" />
      <CampoTexto etiqueta="Sucursal / corresponsal" placeholder="SUC-BOGOTA-01" valor={sucursalId} onCambio={setSucursalId} />
      <CampoTexto etiqueta="Cajero" placeholder="CAJ-042" valor={cajeroId} onCambio={setCajeroId} />

      {tipoOperacion === "CHECK_DEPOSIT" && (
        <>
          <CampoTexto etiqueta="Número de cheque" placeholder="0001234" valor={numeroCheque} onCambio={setNumeroCheque} />
          <CampoTexto etiqueta="Banco emisor del cheque" placeholder="Bancolombia" valor={bancoCheque} onCambio={setBancoCheque} />
        </>
      )}

      <CampoTexto
        etiqueta="Descripción (opcional)"
        placeholder="Consignación nómina"
        valor={descripcion}
        onCambio={setDescripcion}
      />

      <BotonBancario
        titulo={cargando ? "Procesando..." : "Registrar operación"}
        onPress={() => registrar()}
        disabled={cargando}
      />
    </Superficie>
  );
}
