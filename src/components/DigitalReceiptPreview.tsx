import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { formatearFecha } from "../utils";

export interface DigitalReceiptPreviewProps {
  titulo: string;
  /** Respuesta real del backend (useTransferencia/useTransferenciaInternacional/usePagoFactura) — se muestra tal cual, sin datos ficticios. */
  datos: Record<string, any>;
}

async function calcularHashSHA256(payload: string): Promise<string | null> {
  // Solo se calcula si el runtime expone Web Crypto (browser, o RN con el
  // polyfill de expo-crypto/react-native-get-random-values ya instalado). Si
  // no está disponible, se omite el hash en vez de inventarlo.
  const subtle = (globalThis as any)?.crypto?.subtle;
  if (!subtle || typeof subtle.digest !== "function") return null;
  try {
    const bytes = new TextEncoder().encode(payload);
    const buffer = await subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
}

/**
 * Comprobante digital auditado (spec Stitch: "DigitalReceiptPreview"): muestra
 * la respuesta real de la operación (transferencia/pago) más un hash SHA-256
 * del propio comprobante, calculado en el cliente con Web Crypto. Sin campos
 * ficticios: si el backend no trae un dato, no se muestra esa fila.
 */
export function DigitalReceiptPreview({ titulo, datos }: DigitalReceiptPreviewProps) {
  const [hash, setHash] = useState<string | null>(null);
  const payload = JSON.stringify(datos);

  useEffect(() => {
    let vigente = true;
    calcularHashSHA256(payload).then((resultado) => {
      if (vigente) setHash(resultado);
    });
    return () => {
      vigente = false;
    };
  }, [payload]);

  const fecha = datos.fecha || datos.fechaOperacion || datos.createdAt;
  const referencia =
    datos.referenciaLiquidacion || datos.numeroComprobante || datos.transaccionId || datos.id;

  return (
    <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-3">
      <View className="flex-row items-center gap-2">
        <Icono nombre="receipt" color="#84d896" />
        <Text className="font-title-md text-title-md text-on-surface">{titulo}</Text>
      </View>
      {referencia && (
        <Text className="font-label-code text-body-sm text-on-surface-variant">Referencia: {referencia}</Text>
      )}
      {fecha && (
        <Text className="font-body-sm text-body-sm text-on-surface-variant">Fecha: {formatearFecha(fecha)}</Text>
      )}
      {typeof datos.monto === "number" && (
        <Text className="font-body-sm text-body-sm text-on-surface-variant">Monto: {datos.monto}</Text>
      )}
      <View className="pt-2 border-t border-outline-variant/30">
        <Text className="font-label-caps text-label-caps uppercase text-on-surface-variant">
          Hash SHA-256 del comprobante
        </Text>
        <Text className="font-label-code text-body-sm text-on-surface" numberOfLines={1}>
          {hash ?? "No disponible en este runtime"}
        </Text>
      </View>
    </Superficie>
  );
}
