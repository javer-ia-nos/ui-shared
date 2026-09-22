import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { PastillaEstado } from "./PastillaEstado";
import { BotonBancario } from "./BotonBancario";
import { usePermisos, type UsePermisosOptions } from "../hooks/usePermisos";

export interface PastillaPermisosProps extends UsePermisosOptions {}

/** Roles y permisos del usuario, contra ms-seguridad (GET /roles/:userId/permissions). */
export function PastillaPermisos({ userId, usuarioId, apiBaseUrl, token }: PastillaPermisosProps) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const { permisos, cargando, error, cargar } = usePermisos({ userId, usuarioId, apiBaseUrl, token });

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 w-full">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <Icono nombre="badge" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">
            Roles y permisos
          </Text>
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

      {permisos && (
        <>
          <View className="gap-2">
            <Text className="font-label-md text-label-md text-on-surface-variant">Roles</Text>
            <View className="flex-row flex-wrap gap-2">
              {permisos.roles.map((rol) => (
                <PastillaEstado key={rol} texto={rol} tono="secondary" />
              ))}
            </View>
          </View>
          <View className="gap-2">
            <Text className="font-label-md text-label-md text-on-surface-variant">Permisos</Text>
            <View className="flex-row flex-wrap gap-2">
              {permisos.permissions.map((permiso) => (
                <PastillaEstado key={permiso} texto={permiso} tono="primary" />
              ))}
            </View>
          </View>
        </>
      )}

      {!permisos && !cargando && !error && (
        <Text className="text-on-surface-variant font-body-sm text-body-sm">
          Sin información de roles todavía.
        </Text>
      )}
    </Superficie>
  );
}
