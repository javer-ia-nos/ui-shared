import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Icono } from "./Icono";
import { PastillaEstado } from "./PastillaEstado";

export interface ItemNavegacion {
  ruta: string;
  etiqueta: string;
}

export interface EncabezadoAppProps {
  items: ItemNavegacion[];
  rutaActiva?: string;
  onNavegar?: (ruta: string) => void;
  nombreUsuario?: string;
  rolUsuario?: string;
  onNotificaciones?: () => void;
  onCerrarSesion?: () => void;
  /** Oculta la fila de navegación horizontal (útil en móvil, donde la navegación vive en BarraNavegacionInferior). */
  mostrarNavegacion?: boolean;
}

/**
 * Barra superior universal (Web y Móvil). No se acopla a ningún router concreto:
 * recibe los items de navegación por props y delega la navegación real a `onNavegar`
 * — así `web` puede pasar rutas de Astro y `mobile` puede omitir la nav o usarla
 * como tabs, sin que este componente sepa cuál es cuál.
 */
export function EncabezadoApp({
  items,
  rutaActiva,
  onNavegar,
  nombreUsuario,
  rolUsuario,
  onNotificaciones,
  onCerrarSesion,
  mostrarNavegacion = true,
}: EncabezadoAppProps) {
  return (
    <View className="bg-surface/90 px-4 py-3 flex-row items-center justify-between gap-4">
      <View className="flex-row items-center gap-2 flex-shrink-0">
        <Text className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
          Javer-IA-nos
        </Text>
        <View className="hidden sm:flex">
          <PastillaEstado texto="sync" tono="secondary" />
        </View>
      </View>

      {mostrarNavegacion && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 mx-2">
          <View className="flex-row gap-1">
            {items.map((item) => {
              const activo = item.ruta === rutaActiva;
              return (
                <Pressable
                  key={item.ruta}
                  onPress={() => onNavegar?.(item.ruta)}
                  className={`px-3 py-2 rounded-lg ${activo ? "bg-primary-container" : ""}`}
                >
                  <Text
                    className={`font-body-md text-body-md ${
                      activo ? "text-primary font-medium" : "text-on-surface-variant"
                    }`}
                  >
                    {item.etiqueta}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}

      <View className="flex-row items-center gap-3 flex-shrink-0">
        <Pressable
          onPress={onNotificaciones}
          accessibilityRole="button"
          accessibilityLabel="Notificaciones"
          className="p-2 rounded-lg bg-surface-container-low"
        >
          <Icono nombre="notifications" color="#c4c6cf" />
        </Pressable>
        {nombreUsuario && (
          <View className="items-end hidden md:flex">
            <Text className="font-body-md text-body-md text-on-surface font-medium">{nombreUsuario}</Text>
            {rolUsuario && <Text className="font-body-sm text-body-sm text-on-surface-variant">{rolUsuario}</Text>}
          </View>
        )}
        {onCerrarSesion && (
          <Pressable
            onPress={onCerrarSesion}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            className="p-1.5"
          >
            <Icono nombre="logout" color="#c4c6cf" />
          </Pressable>
        )}
      </View>
    </View>
  );
}
