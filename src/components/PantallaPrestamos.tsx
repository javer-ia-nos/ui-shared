import React, { useState } from "react";
import { View, Text } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { PastillaEstado } from "./PastillaEstado";
import { usePrestamos, type UsePrestamosOptions, type CuotaPrestamo } from "../hooks/usePrestamos";
import { formatearMoneda, formatearFecha } from "../utils";

export interface PantallaPrestamosProps extends UsePrestamosOptions {}

function FilaCuota({
  cuota,
  prestamoId,
  cuentaOrigen,
  cargandoCuota,
  onPagar,
}: {
  cuota: CuotaPrestamo;
  prestamoId: string;
  cuentaOrigen: string;
  cargandoCuota: number | null;
  onPagar: (numero: number) => void;
}) {
  const pagada = cuota.estado === "PAID" || cuota.estado === "PAGADA";
  return (
    <View className="flex-row items-center justify-between p-3 bg-surface-container rounded-xl border border-outline-variant/30">
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Icono nombre={pagada ? "check_circle" : "event_repeat"} color={pagada ? "#84d896" : "#8591b3"} />
          <Text className="font-title-md text-title-md text-on-surface">Cuota {cuota.numero}</Text>
          <PastillaEstado texto={cuota.estado} tono={pagada ? "secondary" : "neutral"} />
        </View>
        <Text className="font-body-sm text-body-sm text-on-surface-variant">
          {formatearMoneda(cuota.monto)} (capital {formatearMoneda(cuota.capital)} + interés{" "}
          {formatearMoneda(cuota.interes)})
        </Text>
        <Text className="font-label-sm text-label-sm text-on-surface-variant/80">
          Vence el {formatearFecha(cuota.fechaVencimiento)}
        </Text>
      </View>
      {!pagada && (
        <BotonBancario
          titulo={cargandoCuota === cuota.numero ? "Pagando..." : "Pagar"}
          variante="secundario"
          onPress={() => onPagar(cuota.numero)}
          disabled={cargandoCuota !== null || !cuentaOrigen}
        />
      )}
    </View>
  );
}

/** CU-13: solicitud de préstamos, consulta de detalle y pago de cuotas. */
export function PantallaPrestamos(props: PantallaPrestamosProps) {
  const {
    montoSolicitado,
    setMontoSolicitado,
    plazoMeses,
    setPlazoMeses,
    ingresoMensual,
    setIngresoMensual,
    cargando,
    error,
    prestamo,
    solicitarPrestamo,
    consultarPrestamo,
    pagarCuota,
    cargandoCuota,
    reset,
  } = usePrestamos(props);

  const [idConsulta, setIdConsulta] = useState("");
  const [cuentaPago, setCuentaPago] = useState("");

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-6 w-full">
      <View className="flex-row items-center gap-2">
        <Icono nombre="payments" color="#b5c4ff" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">Préstamos (CU-13)</Text>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-4">
        <Text className="font-title-md text-title-md text-on-surface">Consultar préstamo existente</Text>
        <CampoTexto
          etiqueta="ID de préstamo (UUID)"
          placeholder="00000000-0000-0000-0000-000000000001"
          valor={idConsulta}
          onCambio={setIdConsulta}
        />
        <BotonBancario
          titulo={cargando ? "Consultando..." : "Consultar"}
          variante="secundario"
          onPress={() => idConsulta && consultarPrestamo(idConsulta)}
          disabled={cargando || !idConsulta}
        />
      </Superficie>

      {prestamo && (
        <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-title-md text-title-md text-on-surface">{prestamo.mensaje}</Text>
            <PastillaEstado texto={prestamo.estado} tono="secondary" />
          </View>
          <View className="flex-row gap-4 flex-wrap">
            <View>
              <Text className="font-label-sm text-label-sm text-on-surface-variant">Monto aprobado</Text>
              <Text className="font-headline-sm text-headline-sm text-primary">
                {formatearMoneda(prestamo.montoAprobado)}
              </Text>
            </View>
            <View>
              <Text className="font-label-sm text-label-sm text-on-surface-variant">Cuota mensual</Text>
              <Text className="font-headline-sm text-headline-sm text-secondary">
                {formatearMoneda(prestamo.cuotaMensual)}
              </Text>
            </View>
            <View>
              <Text className="font-label-sm text-label-sm text-on-surface-variant">Tasa EA / Plazo</Text>
              <Text className="font-title-md text-title-md text-on-surface">
                {(prestamo.tasaEA * 100).toFixed(2)}% · {prestamo.plazoMeses} meses
              </Text>
            </View>
          </View>

          <CampoTexto
            etiqueta="Cuenta para pagar cuotas (UUID)"
            placeholder="00000000-0000-0000-0000-000000000001"
            valor={cuentaPago}
            onCambio={setCuentaPago}
          />

          <Text className="font-title-md text-title-md text-on-surface mt-1">Tabla de amortización</Text>
          <View className="gap-2">
            {prestamo.cuotas.map((cuota) => (
              <FilaCuota
                key={cuota.numero}
                cuota={cuota}
                prestamoId={prestamo.id}
                cuentaOrigen={cuentaPago}
                cargandoCuota={cargandoCuota}
                onPagar={(numero) => pagarCuota(prestamo.id, numero, cuentaPago)}
              />
            ))}
          </View>
        </Superficie>
      )}

      <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-4">
        <Text className="font-title-md text-title-md text-on-surface">Solicitar nuevo préstamo</Text>
        <CampoTexto
          etiqueta="Monto solicitado (COP)"
          placeholder="10000000"
          valor={montoSolicitado}
          onCambio={setMontoSolicitado}
          teclado="numeric"
        />
        <CampoTexto
          etiqueta="Plazo (meses, 6-120)"
          placeholder="24"
          valor={plazoMeses}
          onCambio={setPlazoMeses}
          teclado="numeric"
        />
        <CampoTexto
          etiqueta="Ingreso mensual (COP)"
          placeholder="3500000"
          valor={ingresoMensual}
          onCambio={setIngresoMensual}
          teclado="numeric"
        />
        <BotonBancario
          titulo={cargando ? "Procesando..." : "Solicitar préstamo"}
          onPress={() => solicitarPrestamo()}
          disabled={cargando}
        />
        {prestamo && (
          <BotonBancario titulo="Limpiar formulario" variante="secundario" onPress={reset} />
        )}
      </Superficie>
    </Superficie>
  );
}
