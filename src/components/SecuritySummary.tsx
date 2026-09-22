import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { BotonBancario } from "./BotonBancario";
import { useDispositivos, type UseDispositivosOptions } from "../hooks/useDispositivos";

export interface SecuritySummaryProps extends UseDispositivosOptions {
  onVerMas?: () => void;
}

/**
 * Resumen de seguridad (spec Stitch: "SecuritySummary" / Bento Tile 1,
 * "Dispositivos Confiables Autorizados") contra ms-seguridad real. No incluye
 * "Última sesión iniciada" con IP/ubicación: ese dato no lo expone ningún
 * hook existente, así que se omite en vez de inventarlo.
 */
export function SecuritySummary({ onVerMas, ...opciones }: SecuritySummaryProps) {
  const { dispositivos, cargando, error, cargar } = useDispositivos(opciones);
  const effectiveUserId = opciones.userId ?? opciones.usuarioId ?? "";

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  const confiables = dispositivos.filter((d) => d.confianza !== null).length;

  return (
    <Superficie nivel="container" redondeo="2xl" padding="lg" className="gap-4 lg:w-[320px] lg:flex-shrink-0">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="p-2 rounded-lg bg-surface-container-high">
            <Icono nombre="security" color="#b5c4ff" />
          </View>
          <Text className="font-headline-sm text-body-lg font-semibold text-on-surface">Resumen de Seguridad</Text>
        </View>
        {!error && (
          <Text className="font-label-code text-label-code text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full font-medium">
            {confiables > 0 ? "Activo" : "Sin verificar"}
          </Text>
        )}
      </View>

      {error && <Text className="text-on-surface-variant font-body-sm text-body-sm">{error}</Text>}

      <View className="gap-1">
        <Text className="font-label-caps text-label-caps uppercase text-on-surface-variant">
          Dispositivos Confiables Autorizados
        </Text>
        {cargando && dispositivos.length === 0 ? (
          <Text className="font-body-sm text-body-sm text-on-surface-variant mt-1">Cargando…</Text>
        ) : dispositivos.length === 0 ? (
          <Text className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Este usuario todavía no tiene dispositivos registrados.
          </Text>
        ) : (
          <View className="gap-2 mt-1">
            {dispositivos.slice(0, 3).map((d) => (
              <View key={d.id} className="flex-row items-center justify-between p-2 rounded-lg bg-surface-container-lowest">
                <View className="flex-row items-center gap-2 flex-1 min-w-0">
                  <Icono
                    nombre={d.plataforma?.toLowerCase().includes("ios") || d.plataforma?.toLowerCase().includes("android") ? "smartphone" : "computer"}
                    tamaño={18}
                    color="#b1c7f0"
                  />
                  <Text className="font-body-sm text-body-sm text-on-surface flex-1" numberOfLines={1}>
                    {d.nombre || "Dispositivo sin nombre"}
                  </Text>
                </View>
                <Text className={`font-label-code text-[11px] ${d.confianza ? "text-[#10B981]" : "text-on-surface-variant"}`}>
                  {d.confianza ? "Confiable" : "Pendiente"}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {onVerMas && <BotonBancario titulo="Ver dispositivos y sesiones" variante="secundario" onPress={onVerMas} />}
    </Superficie>
  );
}
