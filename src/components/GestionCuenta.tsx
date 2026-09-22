import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { PastillaEstado } from "./PastillaEstado";
import { useGestionCuenta, type EstadoCuenta } from "../hooks/useGestionCuenta";
import type { TipoCuenta } from "../hooks/useAperturaCuenta";
import { formatearMoneda } from "../utils";

export interface GestionCuentaProps {
  cuentaId: string;
  tipoCuenta: TipoCuenta;
  apiBaseUrl?: string;
  token?: string;
}

/** CU-06 / CU-07: edición, cotitulares y cierre de una cuenta existente en ms-cuentas. */
export function GestionCuenta({ cuentaId, tipoCuenta, apiBaseUrl, token }: GestionCuentaProps) {
  const { cuenta, cargando, error, consultar, modificar, agregarCotitular, cerrar } = useGestionCuenta({
    cuentaId,
    tipoCuenta,
    apiBaseUrl,
    token,
  });
  const [alias, setAlias] = useState("");
  const [cotitularId, setCotitularId] = useState("");
  const [confirmarCierre, setConfirmarCierre] = useState(false);
  const [cerrada, setCerrada] = useState(false);

  useEffect(() => {
    consultar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuentaId]);

  useEffect(() => {
    if (cuenta) setAlias(cuenta.alias ?? "");
  }, [cuenta]);

  const cambiarEstado = (status: EstadoCuenta) => modificar({ status });

  const ejecutarCierre = async () => {
    const ok = await cerrar();
    if (ok) setCerrada(true);
    setConfirmarCierre(false);
  };

  if (cerrada) {
    return (
      <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-2 w-full">
        <Text className="font-headline-sm text-headline-sm text-on-surface">Cuenta cerrada</Text>
        <Text className="text-on-surface-variant font-body-sm text-body-sm">
          La cuenta {cuenta?.accountNumber ?? cuentaId} fue cancelada correctamente.
        </Text>
      </Superficie>
    );
  }

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-6 w-full">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icono nombre="account_balance" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">
            Gestionar cuenta {cuenta?.accountNumber ?? ""}
          </Text>
        </View>
        {cuenta && <PastillaEstado texto={cuenta.status} tono={cuenta.status === "ACTIVE" ? "secondary" : "error"} />}
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      {cuenta && (
        <View className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
          <Text className="text-on-surface-variant font-label-md text-label-md">Saldo disponible</Text>
          <Text className="font-headline-sm text-headline-sm text-primary mt-1">
            {formatearMoneda(cuenta.balance)}
          </Text>
        </View>
      )}

      <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-4">
        <Text className="font-title-md text-title-md text-on-surface">Editar alias</Text>
        <CampoTexto etiqueta="Alias" valor={alias} onCambio={setAlias} placeholder="Mi cuenta" />
        <BotonBancario
          titulo={cargando ? "Guardando..." : "Guardar alias"}
          onPress={() => modificar({ alias })}
          disabled={cargando}
        />
      </Superficie>

      <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-3">
        <Text className="font-title-md text-title-md text-on-surface">Estado de la cuenta</Text>
        <View className="flex-row gap-2">
          <BotonBancario
            titulo="Activar"
            variante="secundario"
            onPress={() => cambiarEstado("ACTIVE")}
            disabled={cargando}
          />
          <BotonBancario
            titulo="Bloquear"
            variante="peligro"
            onPress={() => cambiarEstado("BLOCKED")}
            disabled={cargando}
          />
        </View>
      </Superficie>

      <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-4">
        <Text className="font-title-md text-title-md text-on-surface">Agregar cotitular</Text>
        <CampoTexto
          etiqueta="Usuario (UUID)"
          valor={cotitularId}
          onCambio={setCotitularId}
          placeholder="00000000-0000-0000-0000-000000000003"
        />
        <BotonBancario
          titulo={cargando ? "Agregando..." : "Agregar cotitular"}
          onPress={async () => {
            const ok = await agregarCotitular(cotitularId);
            if (ok) setCotitularId("");
          }}
          disabled={cargando || !cotitularId}
        />
        {cuenta && cuenta.titulares.length > 0 && (
          <View className="gap-2 mt-1">
            {cuenta.titulares.map((t) => (
              <Text key={t.id} className="font-body-sm text-body-sm text-on-surface-variant">
                {t.userId} · {t.holderRole}
              </Text>
            ))}
          </View>
        )}
      </Superficie>

      <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-3">
        <Text className="font-title-md text-title-md text-error">Cerrar cuenta</Text>
        {!confirmarCierre ? (
          <BotonBancario titulo="Cerrar cuenta" variante="peligro" onPress={() => setConfirmarCierre(true)} />
        ) : (
          <View className="gap-2">
            <Text className="font-body-sm text-body-sm text-on-surface-variant">
              Esta acción cancela la cuenta de forma permanente. ¿Confirmas?
            </Text>
            <View className="flex-row gap-2">
              <BotonBancario
                titulo={cargando ? "Cerrando..." : "Sí, cerrar"}
                variante="peligro"
                onPress={ejecutarCierre}
                disabled={cargando}
              />
              <BotonBancario titulo="Cancelar" variante="secundario" onPress={() => setConfirmarCierre(false)} />
            </View>
          </View>
        )}
      </Superficie>
    </Superficie>
  );
}
