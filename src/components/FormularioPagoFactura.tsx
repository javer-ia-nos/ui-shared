import React from "react";
import { View, Text } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { usePagoFactura, type UsePagoFacturaOptions } from "../hooks/usePagoFactura";

export interface FormularioPagoFacturaProps extends UsePagoFacturaOptions {}

/** CU-27: pago de facturas de servicios por convenio, contra ms-transacciones. */
export function FormularioPagoFactura({ cuentaId, apiBaseUrl, token, onSuccess, onError }: FormularioPagoFacturaProps) {
  const {
    cuentaId: cuenta,
    setCuentaId,
    codigoConvenio,
    setCodigoConvenio,
    referenciaFactura,
    setReferenciaFactura,
    monto,
    setMonto,
    cargando,
    error,
    resultado,
    pagar,
    reset,
  } = usePagoFactura({ cuentaId, apiBaseUrl, token, onSuccess, onError });

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 max-w-md w-full">
      <View className="flex-row items-center gap-2 mb-2">
        <Icono nombre="receipt_long" color="#b5c4ff" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">Pago de facturas (CU-27)</Text>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      {resultado && (
        <View className="bg-tertiary-container rounded-xl px-4 py-3 gap-2">
          <Text className="text-on-tertiary-container font-body-sm text-body-sm">
            {resultado.mensaje || "¡Factura pagada!"} · Comprobante {resultado.numeroComprobante}
          </Text>
          <BotonBancario titulo="Pagar otra factura" variante="secundario" onPress={reset} />
        </View>
      )}

      <CampoTexto
        etiqueta="Cuenta a debitar (UUID)"
        placeholder="00000000-0000-0000-0000-000000000001"
        valor={cuenta}
        onCambio={setCuentaId}
      />
      <CampoTexto
        etiqueta="Código de convenio"
        placeholder="ENEL-001"
        valor={codigoConvenio}
        onCambio={setCodigoConvenio}
      />
      <CampoTexto
        etiqueta="Referencia de la factura"
        placeholder="987654321"
        valor={referenciaFactura}
        onCambio={setReferenciaFactura}
      />
      <CampoTexto etiqueta="Monto" placeholder="85000" valor={monto} onCambio={setMonto} teclado="numeric" />

      <BotonBancario titulo={cargando ? "Procesando..." : "Pagar factura"} onPress={() => pagar()} disabled={cargando} />
    </Superficie>
  );
}
