import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { PastillaEstado } from "./PastillaEstado";
import { SelectorCuenta } from "./SelectorCuenta";
import { FormularioTransferencia } from "./FormularioTransferencia";
import { FormularioTransferenciaInternacional } from "./FormularioTransferenciaInternacional";
import { FormularioPagoFactura } from "./FormularioPagoFactura";
import { PantallaPagosQR } from "./PantallaPagosQR";
import { GestionPagosProgramados } from "./GestionPagosProgramados";
import { GestionBeneficiarios } from "./GestionBeneficiarios";
import { DigitalReceiptPreview } from "./DigitalReceiptPreview";
import type { CuentaResuelta } from "../hooks/useResolverCuenta";

export type DestinoTransferencia = "propias" | "swift";
type TabHub = "transferencias" | "servicios" | "qr" | "programados";

export interface PantallaTransferenciasPagosProps {
  userId?: string;
  usuarioId?: string;
  token?: string;
}

const TABS: Array<{ id: TabHub; etiqueta: string; icono: "sync_alt" | "receipt_long" | "qr_code_2" | "event_repeat" }> = [
  { id: "transferencias", etiqueta: "Transferencias Inmediatas", icono: "sync_alt" },
  { id: "servicios", etiqueta: "Pago de Servicios & Matrícula", icono: "receipt_long" },
  { id: "qr", etiqueta: "Código QR Cobro/Pago", icono: "qr_code_2" },
  { id: "programados", etiqueta: "Pagos Programados", icono: "event_repeat" },
];

const DESTINOS: Array<{ id: DestinoTransferencia; etiqueta: string; sub: string; icono: "domain" | "public" }> = [
  { id: "propias", etiqueta: "Cuentas Propias / Otros Bancos", sub: "Red Javer-IA-nos & ACH", icono: "domain" },
  { id: "swift", etiqueta: "Internacional", sub: "Red SWIFT / Wire", icono: "public" },
];

/**
 * Pantalla universal "Transferencias & Pagos" (spec Stitch: hub con 4 tabs —
 * Transferencias Inmediatas, Pago de Servicios & Matrícula, Código QR,
 * Pagos Programados — y panel maestro-detalle con directorio de
 * beneficiarios). Todo contra ms-transacciones/ms-cuentas reales; el
 * "comprobante previsto" (DigitalReceiptPreview) solo aparece tras una
 * operación real exitosa, con los datos que el backend devolvió.
 */
export function PantallaTransferenciasPagos({ userId, usuarioId, token }: PantallaTransferenciasPagosProps) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const [tab, setTab] = useState<TabHub>("transferencias");
  const [destino, setDestino] = useState<DestinoTransferencia>("propias");
  const [cuentaProgramados, setCuentaProgramados] = useState<CuentaResuelta | null>(null);
  const [ultimoComprobante, setUltimoComprobante] = useState<{ titulo: string; datos: Record<string, any> } | null>(
    null,
  );

  return (
    <View className="gap-6 p-4">
      {/* Header context strip */}
      <View className="gap-2">
        <View className="flex-row flex-wrap items-center gap-2">
          <View className="px-2 py-0.5 rounded-full bg-secondary-container/20">
            <Text className="font-label-code text-label-code text-secondary">Módulo Transaccional Seguro</Text>
          </View>
          <Text className="font-label-code text-label-code text-on-surface-variant">
            Sincronizado con banking://screens/transfers
          </Text>
        </View>
        <View className="flex-row flex-wrap items-baseline gap-2">
          <Text className="font-headline-lg text-headline-lg text-on-surface">Centro de Transferencias & Pagos</Text>
          <Text className="font-body-md text-body-md text-tertiary">Comisión $0 COP en red Javer-IA-nos & Transfiya</Text>
        </View>
      </View>

      {/* Tab switcher */}
      <View className="flex-row flex-wrap gap-1 p-1.5 rounded-xl bg-surface-container-low">
        {TABS.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTab(t.id)}
            className={`flex-1 min-w-[150px] py-2 px-3 rounded-lg items-center flex-row justify-center gap-2 ${
              tab === t.id ? "bg-primary-container" : ""
            }`}
          >
            <Icono nombre={t.icono} tamaño={18} color={tab === t.id ? "#0b2545" : "#c4c6cf"} />
            <Text
              className={`font-body-md text-body-md font-semibold ${
                tab === t.id ? "text-on-primary-container" : "text-on-surface-variant"
              }`}
            >
              {t.etiqueta}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="gap-6 lg:flex-row lg:items-start">
        {/* Panel izquierdo: formulario activo según tab */}
        <View className="gap-6 lg:flex-1">
          {tab === "transferencias" && (
            <>
              <View className="gap-2">
                <Text className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Tipo de Destino
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {DESTINOS.map((d) => (
                    <Pressable
                      key={d.id}
                      onPress={() => setDestino(d.id)}
                      className={`flex-1 min-w-[180px] p-3 rounded-xl gap-1 ${
                        destino === d.id ? "bg-primary-container" : "bg-surface-container-high"
                      }`}
                    >
                      <Icono nombre={d.icono} color={destino === d.id ? "#0b2545" : "#b1c7f0"} />
                      <Text
                        className={`font-body-md text-body-md font-semibold ${
                          destino === d.id ? "text-on-primary-container" : "text-on-surface"
                        }`}
                      >
                        {d.etiqueta}
                      </Text>
                      <Text
                        className={`font-label-code text-label-code ${
                          destino === d.id ? "text-on-primary-container" : "text-on-surface-variant"
                        }`}
                      >
                        {d.sub}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {destino === "propias" ? (
                <FormularioTransferencia
                  token={token}
                  onSuccess={(datos) => setUltimoComprobante({ titulo: "Comprobante de transferencia", datos })}
                />
              ) : (
                <FormularioTransferenciaInternacional
                  token={token}
                  onSuccess={(datos) =>
                    setUltimoComprobante({ titulo: "Comprobante de transferencia SWIFT", datos })
                  }
                />
              )}
            </>
          )}

          {tab === "servicios" && (
            <FormularioPagoFactura
              token={token}
              onSuccess={(datos) => setUltimoComprobante({ titulo: "Comprobante de pago de servicios", datos })}
            />
          )}

          {tab === "qr" && <PantallaPagosQR token={token} />}

          {tab === "programados" && (
            <View className="gap-4">
              <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-2">
                <SelectorCuenta
                  etiqueta="Cuenta origen para pagos automáticos"
                  token={token}
                  onResuelta={setCuentaProgramados}
                />
              </Superficie>
              {cuentaProgramados && (
                <GestionPagosProgramados cuentaOrigen={cuentaProgramados.id} token={token} />
              )}
            </View>
          )}

          {ultimoComprobante && (
            <DigitalReceiptPreview titulo={ultimoComprobante.titulo} datos={ultimoComprobante.datos} />
          )}
        </View>

        {/* Panel derecho: directorio de beneficiarios */}
        <View className="gap-6 lg:w-[360px] lg:flex-shrink-0">
          <GestionBeneficiarios userId={effectiveUserId} token={token} />
        </View>
      </View>
    </View>
  );
}
