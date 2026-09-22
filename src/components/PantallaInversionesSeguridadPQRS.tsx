import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { FormularioAperturaCDT } from "./FormularioAperturaCDT";
import { FormularioInversion } from "./FormularioInversion";
import { PantallaPrestamos } from "./PantallaPrestamos";
import { PantallaDispositivosConfiables } from "./PantallaDispositivosConfiables";
import { SupportChatPQRS } from "./SupportChatPQRS";
import type { NombreSimbolo } from "./simbolos";

export type TabInversionesSeguridad = "cdt" | "creditos" | "auditoria" | "pqrs";

export interface PantallaInversionesSeguridadPQRSProps {
  userId?: string;
  usuarioId?: string;
  token?: string;
  tabInicial?: TabInversionesSeguridad;
}

const TABS: Array<{ id: TabInversionesSeguridad; etiqueta: string; icono: NombreSimbolo }> = [
  { id: "cdt", etiqueta: "CDT Digital Deceval", icono: "trending_up" },
  { id: "creditos", etiqueta: "Crédito Educativo", icono: "school" },
  { id: "auditoria", etiqueta: "Seguridad & Sesiones", icono: "security" },
  { id: "pqrs", etiqueta: "Atención & Radicación PQRS", icono: "support_agent" },
];

const GARANTIAS = [
  { icono: "verified" as const, titulo: "Depósitos FOGAFÍN", texto: "Protección asegurada por ley colombiana." },
  { icono: "account_balance" as const, titulo: "Custodia Deceval", texto: "Títulos valores desmaterializados con custodia legal." },
  { icono: "school" as const, titulo: "Sello Javeriano", texto: "Tarifas preferenciales para la comunidad educativa." },
  { icono: "verified_user" as const, titulo: "Monitoreo Antifraude", texto: "Prevención y detección de anomalías en tiempo real." },
];

/**
 * Pantalla universal "Inversiones, Seguridad & PQRS" (spec Stitch): CDT
 * custodiado (ms-financiero), crédito educativo (ms-financiero), consola de
 * dispositivos/sesiones de confianza (ms-seguridad) y chat/PQRS (ms-crm).
 */
export function PantallaInversionesSeguridadPQRS({
  userId,
  usuarioId,
  token,
  tabInicial = "cdt",
}: PantallaInversionesSeguridadPQRSProps) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const [tab, setTab] = useState<TabInversionesSeguridad>(tabInicial);

  return (
    <View className="gap-6 p-4">
      {/* Banner institucional */}
      <Superficie nivel="container-low" redondeo="2xl" padding="lg" className="gap-4">
        <View className="flex-row items-start gap-3">
          <View className="w-12 h-12 rounded-xl bg-surface-container items-center justify-center">
            <Icono nombre="account_balance" color="#b5c4ff" tamaño={28} />
          </View>
          <View className="flex-1">
            <Text className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
              Ecosistema Institucional
            </Text>
            <Text className="font-headline-lg text-headline-lg text-on-surface">Inversiones, Seguridad & PQRS</Text>
            <Text className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Gestión de patrimonio digital protegido, financiamiento universitario y centro de respuesta institucional.
            </Text>
          </View>
        </View>
        <View className="flex-row flex-wrap gap-2">
          <View className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container">
            <Icono nombre="verified_user" tamaño={16} color="#b5c4ff" />
            <Text className="font-label-code text-label-code text-on-surface">Deceval & FOGAFÍN</Text>
          </View>
        </View>
      </Superficie>

      {/* Navegación por categorías */}
      <View className="flex-row flex-wrap gap-2">
        {TABS.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-lg flex-row items-center gap-2 ${
              tab === t.id ? "bg-primary-container" : "bg-surface-container"
            }`}
          >
            <Icono nombre={t.icono} tamaño={18} color={tab === t.id ? "#0b2545" : "#c4c6cf"} />
            <Text
              className={`font-body-md text-body-md font-medium ${
                tab === t.id ? "text-on-primary-container" : "text-on-surface-variant"
              }`}
            >
              {t.etiqueta}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "cdt" && (
        <View className="gap-6 lg:flex-row lg:items-start">
          <View className="lg:flex-1">
            <FormularioAperturaCDT userId={effectiveUserId} token={token} />
          </View>
          <View className="lg:flex-1">
            <FormularioInversion userId={effectiveUserId} token={token} />
          </View>
        </View>
      )}

      {tab === "creditos" && <PantallaPrestamos userId={effectiveUserId} token={token} />}

      {tab === "auditoria" && <PantallaDispositivosConfiables userId={effectiveUserId} token={token} />}

      {tab === "pqrs" && <SupportChatPQRS userId={effectiveUserId} token={token} />}

      {/* Franja de garantías institucionales */}
      <View className="flex-row flex-wrap gap-4 mt-2">
        {GARANTIAS.map((g) => (
          <Superficie key={g.titulo} nivel="container-low" redondeo="2xl" padding="md" className="flex-row gap-3 flex-1 min-w-[220px]">
            <Icono nombre={g.icono} color="#b5c4ff" tamaño={24} />
            <View className="flex-1">
              <Text className="font-body-md text-body-md font-semibold text-on-surface">{g.titulo}</Text>
              <Text className="font-body-sm text-body-sm text-on-surface-variant">{g.texto}</Text>
            </View>
          </Superficie>
        ))}
      </View>
    </View>
  );
}
