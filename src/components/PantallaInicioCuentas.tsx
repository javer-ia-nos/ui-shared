import React from "react";
import { View, Text } from "react-native";
import { Icono, type IconoProps } from "./Icono";
import { Superficie } from "./Superficie";
import { PastillaEstado } from "./PastillaEstado";
import { TarjetaSaldo } from "./TarjetaSaldo";
import { BotonBancario } from "./BotonBancario";
import { formatearMoneda, enmascararCuenta } from "../utils";

export interface CuentaResumen {
  id: string;
  titulo: string;
  numeroCuenta: string;
  tipoCuenta: "AHORROS" | "CORRIENTE";
  saldoDisponible: number;
  etiquetaExtra?: string;
}

export interface BolsilloResumen {
  id: string;
  titulo: string;
  descripcion: string;
  metaTotal: number;
  ahorrado: number;
}

export interface MovimientoResumen {
  id: string;
  titulo: string;
  detalle: string;
  referencia: string;
  fecha: string;
  monto: number;
  esIngreso?: boolean;
}

export interface CertificadoResumen {
  id: string;
  icono: IconoProps["nombre"];
  titulo: string;
  descripcion: string;
}

export interface PantallaInicioCuentasProps {
  cuentas?: CuentaResumen[];
  bolsillos?: BolsilloResumen[];
  movimientos?: MovimientoResumen[];
  certificados?: CertificadoResumen[];
}

const CUENTAS_DEMO: CuentaResumen[] = [
  {
    id: "1",
    titulo: "Cuenta de Ahorros Nómina Estudiantil",
    numeroCuenta: "8920000041924",
    tipoCuenta: "AHORROS",
    saldoDisponible: 9350200,
    etiquetaExtra: "Exenta 4x1000",
  },
  {
    id: "2",
    titulo: "Cuenta Corriente Proyectos Semillero",
    numeroCuenta: "3105000098111",
    tipoCuenta: "CORRIENTE",
    saldoDisponible: 5500000,
    etiquetaExtra: "Gravamen 4x1000 Estándar",
  },
];

const BOLSILLOS_DEMO: BolsilloResumen[] = [
  {
    id: "1",
    titulo: "Matrícula Javeriana 2026-2",
    descripcion: "Deducción automática programada el día 30 de cada mes",
    metaTotal: 12000000,
    ahorrado: 7800000,
  },
  {
    id: "2",
    titulo: "Fondo de Emergencia",
    descripcion: "Colchón financiero personal para contingencias médicas o técnicas",
    metaTotal: 3000000,
    ahorrado: 1700000,
  },
];

const MOVIMIENTOS_DEMO: MovimientoResumen[] = [
  {
    id: "1",
    titulo: "Pontificia Universidad Javeriana",
    detalle: "Pago Derechos Pecuniarios • Canal PSE",
    referencia: "TX-PSE-892104",
    fecha: "Hoy, 14:20",
    monto: 450000,
  },
  {
    id: "2",
    titulo: "Transferencia Transfiya Recibida",
    detalle: "Origen: Felipe Gómez (Móvil •••• 9821)",
    referencia: "TX-TRF-441092",
    fecha: "Ayer, 18:05",
    monto: 180000,
    esIngreso: true,
  },
];

const CERTIFICADOS_DEMO: CertificadoResumen[] = [
  {
    id: "1",
    icono: "description",
    titulo: "Certificado Bancario General",
    descripcion: "Titularidad, saldo promedio mensual y exención 4x1000.",
  },
  {
    id: "2",
    icono: "article",
    titulo: "Extracto Mensual Integral",
    descripcion: "Desglose de retenciones, IVA y GMF (4x1000).",
  },
  {
    id: "3",
    icono: "badge",
    titulo: "Certificado de Retención & Saldo",
    descripcion: "Documento reglamentario para declaración de renta DIAN.",
  },
];

/**
 * Pantalla 1 del mockup de Stitch ("Inicio & Cuentas"): saldo consolidado, banner de
 * seguridad, cuentas, bolsillos inteligentes, historial y certificaciones. Datos por
 * props con defaults iguales a los del mockup — sin wiring a APIs reales todavía.
 */
export function PantallaInicioCuentas({
  cuentas = CUENTAS_DEMO,
  bolsillos = BOLSILLOS_DEMO,
  movimientos = MOVIMIENTOS_DEMO,
  certificados = CERTIFICADOS_DEMO,
}: PantallaInicioCuentasProps) {
  const saldoConsolidado = cuentas.reduce((total, cuenta) => total + cuenta.saldoDisponible, 0);

  return (
    <View className="gap-8 p-4">
      {/* Banner de seguridad */}
      <Superficie nivel="container" redondeo="2xl" padding="lg" className="flex-row items-start gap-4">
        <View className="p-2.5 rounded-xl bg-surface-container-high">
          <Icono nombre="verified" tamaño={24} color="#ffb955" />
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Alerta de Seguridad & Dispositivo Confiable
            </Text>
            <PastillaEstado texto="Activo" tono="tertiary" conPunto={false} />
          </View>
          <Text className="font-body-md text-body-md text-on-surface-variant">
            Sesión validada con Huella Biométrica Javer-IA Token. Sin transacciones anómalas
            detectadas en las últimas 72 horas.
          </Text>
        </View>
      </Superficie>

      {/* Saldo consolidado */}
      <TarjetaSaldo
        numeroCuenta="000000000000"
        tipoCuenta="AHORROS"
        saldoDisponible={saldoConsolidado}
      />

      {/* Cuentas */}
      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-headline-lg text-headline-lg text-on-surface">
            Cuentas de Ahorros & Corrientes
          </Text>
        </View>
        <View className="gap-4">
          {cuentas.map((cuenta) => (
            <Superficie key={cuenta.id} nivel="container-high" redondeo="2xl" padding="lg" className="gap-4">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1 gap-1">
                  <Text className="font-body-md text-body-md font-semibold text-on-surface">
                    {cuenta.titulo}
                  </Text>
                  <Text className="font-label-code text-body-md text-on-surface-variant">
                    No. {enmascararCuenta(cuenta.numeroCuenta)}
                  </Text>
                </View>
                <View className="items-end gap-1">
                  <PastillaEstado texto="Activa" tono="secondary" conPunto={false} />
                  {cuenta.etiquetaExtra && (
                    <PastillaEstado texto={cuenta.etiquetaExtra} tono="tertiary" conPunto={false} />
                  )}
                </View>
              </View>
              <View>
                <Text className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Saldo Disponible
                </Text>
                <Text className="font-label-numeric-lg text-headline-lg text-on-surface font-bold">
                  {formatearMoneda(cuenta.saldoDisponible)}
                </Text>
              </View>
            </Superficie>
          ))}
        </View>
      </View>

      {/* Bolsillos inteligentes */}
      <View className="gap-4">
        <Text className="font-headline-lg text-headline-lg text-on-surface">
          Bolsillos Inteligentes & Cron Automático
        </Text>
        <View className="gap-4">
          {bolsillos.map((bolsillo) => {
            const progreso = Math.min(100, Math.round((bolsillo.ahorrado / bolsillo.metaTotal) * 100));
            return (
              <Superficie key={bolsillo.id} nivel="container" redondeo="2xl" padding="lg" className="gap-3">
                <Text className="font-headline-sm text-headline-sm text-on-surface">{bolsillo.titulo}</Text>
                <Text className="font-body-sm text-body-sm text-on-surface-variant">{bolsillo.descripcion}</Text>
                <View className="flex-row justify-between">
                  <Text className="font-body-sm text-body-sm text-on-surface">
                    Ahorrado: {formatearMoneda(bolsillo.ahorrado)}
                  </Text>
                  <Text className="font-label-code text-secondary font-semibold">{progreso}%</Text>
                </View>
                <View className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                  <View
                    className="h-full bg-secondary-container rounded-full"
                    style={{ width: `${progreso}%` }}
                  />
                </View>
              </Superficie>
            );
          })}
        </View>
      </View>

      {/* Historial */}
      <View className="gap-4">
        <Text className="font-headline-lg text-headline-lg text-on-surface">
          Historial de Movimientos Recientes
        </Text>
        <Superficie nivel="container" redondeo="2xl" padding="sm" className="gap-1">
          {movimientos.map((mov) => (
            <View
              key={mov.id}
              className="flex-row items-center justify-between gap-3 p-3 rounded-xl"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 rounded-xl bg-surface-container-highest items-center justify-center">
                  <Icono nombre={mov.esIngreso ? "swap_horiz" : "account_balance"} color="#b1c7f0" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-on-surface" numberOfLines={1}>
                    {mov.titulo}
                  </Text>
                  <Text className="font-body-sm text-body-sm text-on-surface-variant" numberOfLines={1}>
                    {mov.detalle}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text
                  className={`font-label-numeric-md font-bold ${
                    mov.esIngreso ? "text-secondary" : "text-on-surface"
                  }`}
                >
                  {mov.esIngreso ? "+" : "-"} {formatearMoneda(mov.monto)}
                </Text>
                <Text className="font-body-sm text-body-sm text-on-surface-variant">{mov.fecha}</Text>
              </View>
            </View>
          ))}
        </Superficie>
      </View>

      {/* Certificaciones */}
      <View className="gap-4">
        <Text className="font-headline-lg text-headline-lg text-on-surface">
          Certificaciones & Extractos Oficiales
        </Text>
        <View className="gap-4">
          {certificados.map((cert) => (
            <Superficie key={cert.id} nivel="container" redondeo="2xl" padding="lg" className="gap-4">
              <View className="w-12 h-12 rounded-xl bg-primary-container items-center justify-center">
                <Icono nombre={cert.icono} tamaño={24} color="#b1c7f0" />
              </View>
              <View className="gap-1">
                <Text className="font-headline-sm text-headline-sm text-on-surface">{cert.titulo}</Text>
                <Text className="font-body-sm text-body-sm text-on-surface-variant">{cert.descripcion}</Text>
              </View>
              <BotonBancario titulo="Descargar PDF" variante="secundario" onPress={() => {}} />
            </Superficie>
          ))}
        </View>
      </View>
    </View>
  );
}
