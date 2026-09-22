import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { useBolsillos, type Subcuenta } from "../hooks/useBolsillos";
import { formatearMoneda } from "../utils";

export interface GestionBolsillosProps {
  cuentaId?: string;
  parentAccountId?: string;
  apiBaseUrl?: string;
  token?: string;
}

function TarjetaBolsillo({
  bolsillo,
  onOperar,
  onRenombrar,
  onCerrar,
  cargando,
}: {
  bolsillo: Subcuenta;
  onOperar: (tipo: "separar" | "liberar", monto: number) => void;
  onRenombrar: (nombre: string) => void;
  onCerrar: () => void;
  cargando: boolean;
}) {
  const [monto, setMonto] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState(bolsillo.name);
  const [editando, setEditando] = useState(false);

  return (
    <View className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 gap-3">
      <View className="flex-row items-center justify-between">
        {editando ? (
          <View className="flex-1 flex-row items-center gap-2">
            <View className="flex-1">
              <CampoTexto etiqueta="Nombre" valor={nuevoNombre} onCambio={setNuevoNombre} />
            </View>
            <BotonBancario
              titulo="Guardar"
              variante="secundario"
              disabled={cargando}
              onPress={() => {
                onRenombrar(nuevoNombre);
                setEditando(false);
              }}
            />
          </View>
        ) : (
          <>
            <View>
              <Text className="font-title-md text-title-md text-on-surface">{bolsillo.name}</Text>
              <Text className="font-headline-sm text-headline-sm text-secondary mt-1">
                {formatearMoneda(bolsillo.balance)}
              </Text>
            </View>
            <BotonBancario titulo="Renombrar" variante="secundario" onPress={() => setEditando(true)} />
          </>
        )}
      </View>

      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <CampoTexto
            etiqueta="Monto"
            valor={monto}
            onCambio={setMonto}
            teclado="numeric"
            placeholder="20000"
          />
        </View>
        <BotonBancario
          titulo="Apartar"
          disabled={cargando || !monto}
          onPress={() => {
            onOperar("separar", Number(monto));
            setMonto("");
          }}
        />
        <BotonBancario
          titulo="Liberar"
          variante="secundario"
          disabled={cargando || !monto}
          onPress={() => {
            onOperar("liberar", Number(monto));
            setMonto("");
          }}
        />
      </View>

      <BotonBancario titulo="Cerrar bolsillo" variante="peligro" disabled={cargando} onPress={onCerrar} />
    </View>
  );
}

/** CU-08: bolsillos (subcuentas) — crear, apartar/liberar dinero, renombrar y cerrar. */
export function GestionBolsillos({ cuentaId, parentAccountId, apiBaseUrl, token }: GestionBolsillosProps) {
  const effectiveCuentaId = cuentaId ?? parentAccountId ?? "";
  const { subcuentas, totalApartado, cargando, error, cargar, crear, renombrar, separar, liberar, cerrar } =
    useBolsillos({ cuentaId: effectiveCuentaId, apiBaseUrl, token });

  const [nombreNuevo, setNombreNuevo] = useState("");
  const [montoInicial, setMontoInicial] = useState("");

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCuentaId]);

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-6 w-full">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icono nombre="savings" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">Bolsillos (CU-08)</Text>
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

      <View className="flex-1 p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
        <Text className="text-on-surface-variant font-label-md text-label-md">Total apartado</Text>
        <Text className="font-headline-sm text-headline-sm text-primary mt-1">
          {formatearMoneda(totalApartado)}
        </Text>
      </View>

      {subcuentas.length === 0 && !cargando ? (
        <View className="py-8 items-center justify-center bg-surface-container/50 rounded-2xl">
          <Text className="text-on-surface-variant font-body-md text-body-md">
            Esta cuenta todavía no tiene bolsillos.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {subcuentas.map((s) => (
            <TarjetaBolsillo
              key={s.id}
              bolsillo={s}
              cargando={cargando}
              onOperar={(tipo, monto) => (tipo === "separar" ? separar(s.id, monto) : liberar(s.id, monto))}
              onRenombrar={(nombre) => renombrar(s.id, nombre)}
              onCerrar={() => cerrar(s.id)}
            />
          ))}
        </View>
      )}

      <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-4">
        <Text className="font-title-md text-title-md text-on-surface">Crear nuevo bolsillo</Text>
        <CampoTexto
          etiqueta="Nombre"
          valor={nombreNuevo}
          onCambio={setNombreNuevo}
          placeholder="Vacaciones"
        />
        <CampoTexto
          etiqueta="Monto inicial (opcional)"
          valor={montoInicial}
          onCambio={setMontoInicial}
          teclado="numeric"
          placeholder="0"
        />
        <BotonBancario
          titulo={cargando ? "Creando..." : "Crear bolsillo"}
          disabled={cargando || !nombreNuevo}
          onPress={() => {
            crear(nombreNuevo, montoInicial ? Number(montoInicial) : undefined);
            setNombreNuevo("");
            setMontoInicial("");
          }}
        />
      </Superficie>
    </Superficie>
  );
}
