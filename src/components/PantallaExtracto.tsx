import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { useExtractoCuenta, type UseExtractoCuentaOptions } from "../hooks/useExtractoCuenta";
import { formatearMoneda, formatearFecha } from "../utils";

export interface PantallaExtractoProps extends UseExtractoCuentaOptions {}

function FilaMovimiento({ mov }: { mov: { id: string; fecha: string; tipo: "CREDITO" | "DEBITO"; monto: number; descripcion: string; saldoPosterior: number } }) {
  const esCredito = mov.tipo === "CREDITO";
  return (
    <View className="flex-row flex-wrap items-center justify-between gap-2 p-3 bg-surface-container rounded-xl">
      <View className="flex-1 min-w-[140px]">
        <Text className="font-body-md text-body-md text-on-surface">{mov.descripcion}</Text>
        <Text className="font-body-sm text-body-sm text-on-surface-variant">{formatearFecha(mov.fecha)}</Text>
      </View>
      <Text className={`font-title-md text-title-md ${esCredito ? "text-secondary" : "text-error"}`}>
        {esCredito ? "+" : "-"}
        {formatearMoneda(Math.abs(mov.monto))}
      </Text>
    </View>
  );
}

/** CU-11: extracto mensual y movimientos de una cuenta. */
export function PantallaExtracto(props: PantallaExtractoProps) {
  const { movimientos, extracto, cargando, error, cargarMovimientos, cargarExtracto } = useExtractoCuenta(props);
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [anio, setAnio] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    cargarMovimientos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.cuentaId, props.accountId]);

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-6 w-full">
      <View className="flex-row items-center gap-2">
        <Icono nombre="receipt_long" color="#b5c4ff" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">Extracto y movimientos (CU-11)</Text>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-4">
        <Text className="font-title-md text-title-md text-on-surface">Generar extracto mensual</Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <CampoTexto etiqueta="Mes" valor={mes} onCambio={setMes} teclado="numeric" placeholder="1-12" />
          </View>
          <View className="flex-1">
            <CampoTexto etiqueta="Año" valor={anio} onCambio={setAnio} teclado="numeric" placeholder="2026" />
          </View>
        </View>
        <BotonBancario
          titulo={cargando ? "Generando..." : "Generar extracto"}
          onPress={() => cargarExtracto(mes, anio)}
          disabled={cargando}
        />
      </Superficie>

      {extracto && (
        <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-3">
          <Text className="font-title-md text-title-md text-on-surface">
            Extracto {extracto.mes}/{extracto.anio}
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-1 min-w-[45%] p-3 bg-surface-container rounded-xl">
              <Text className="font-label-sm text-label-sm text-on-surface-variant">Saldo inicial</Text>
              <Text className="font-title-md text-title-md text-on-surface">{formatearMoneda(extracto.saldoInicial)}</Text>
            </View>
            <View className="flex-1 min-w-[45%] p-3 bg-surface-container rounded-xl">
              <Text className="font-label-sm text-label-sm text-on-surface-variant">Saldo final</Text>
              <Text className="font-title-md text-title-md text-on-surface">{formatearMoneda(extracto.saldoFinal)}</Text>
            </View>
            <View className="flex-1 min-w-[45%] p-3 bg-surface-container rounded-xl">
              <Text className="font-label-sm text-label-sm text-on-surface-variant">Total créditos</Text>
              <Text className="font-title-md text-title-md text-secondary">{formatearMoneda(extracto.totalCreditos)}</Text>
            </View>
            <View className="flex-1 min-w-[45%] p-3 bg-surface-container rounded-xl">
              <Text className="font-label-sm text-label-sm text-on-surface-variant">Total débitos</Text>
              <Text className="font-title-md text-title-md text-error">{formatearMoneda(extracto.totalDebitos)}</Text>
            </View>
          </View>
          <View className="gap-2 mt-2">
            {extracto.movimientos.map((m) => (
              <FilaMovimiento key={m.id} mov={m} />
            ))}
          </View>
        </Superficie>
      )}

      {!extracto && (
        <View className="gap-2">
          <Text className="font-title-md text-title-md text-on-surface">Movimientos recientes</Text>
          {movimientos.length === 0 && !cargando ? (
            <View className="py-6 items-center justify-center bg-surface-container/50 rounded-2xl">
              <Text className="text-on-surface-variant font-body-md text-body-md">
                Esta cuenta todavía no tiene movimientos registrados.
              </Text>
            </View>
          ) : (
            movimientos.map((m) => <FilaMovimiento key={m.id} mov={m} />)
          )}
        </View>
      )}
    </Superficie>
  );
}
