import React, { useEffect, useState } from "react";
import { View, Text, Platform } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { PastillaEstado } from "./PastillaEstado";
import { useDispositivos } from "../hooks/useDispositivos";
import { formatearFecha } from "../utils";
import type { Dispositivo } from "../types";

export interface PantallaDispositivosConfiablesProps {
  userId?: string;
  usuarioId?: string;
  apiBaseUrl?: string;
  token?: string;
}

// `crypto.randomUUID` no existe en Hermes (React Native) — fallback RFC4122 v4 con Math.random.
function generarUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Genera (y persiste en localStorage cuando existe, i.e. Web) un fingerprint estable
// para EL DISPOSITIVO desde el que se prueba, imitando lo que en una app real
// calcularía el cliente. En React Native (sin localStorage) se genera uno por sesión.
function obtenerFingerprintLocal(): string {
  const clave = "javerianos_device_fingerprint";
  if (typeof localStorage === "undefined") {
    return generarUUID();
  }
  try {
    const existente = localStorage.getItem(clave);
    if (existente) return existente;
    const nuevo = generarUUID();
    localStorage.setItem(clave, nuevo);
    return nuevo;
  } catch {
    return generarUUID();
  }
}

function TarjetaDispositivo({
  dispositivo,
  onRevocar,
}: {
  dispositivo: Dispositivo;
  onRevocar: () => void;
}) {
  const vigente = dispositivo.confianza !== null;
  return (
    <View className="flex-row flex-wrap items-center justify-between gap-3 p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
      <View className="flex-row items-center gap-3 flex-1 min-w-[180px]">
        <Icono
          nombre={
            dispositivo.plataforma?.toLowerCase().includes("ios")
              ? "smartphone"
              : "computer"
          }
          color="#8591b3"
        />
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-title-md text-title-md text-on-surface">
              {dispositivo.nombre || "Dispositivo sin nombre"}
            </Text>
            <PastillaEstado
              tono={vigente ? "secondary" : "error"}
              texto={vigente ? "Confiable" : "No confiable"}
            />
          </View>
          <Text className="font-body-sm text-body-sm text-on-surface-variant font-mono">
            ID: {dispositivo.fingerprint.slice(0, 16)}...
          </Text>
          {dispositivo.confianza && (
            <Text className="font-label-sm text-label-sm text-on-surface-variant/80 mt-1">
              Verificado el {formatearFecha(dispositivo.confianza.verificadoEn)}{" "}
              · Expira el {formatearFecha(dispositivo.confianza.expiraEn)}
            </Text>
          )}
        </View>
      </View>
      <BotonBancario titulo="Revocar" variante="peligro" onPress={onRevocar} />
    </View>
  );
}

/** CU-17: registro, consulta y revocación de dispositivos confiables. */
export function PantallaDispositivosConfiables({
  userId,
  usuarioId,
  apiBaseUrl,
  token,
}: PantallaDispositivosConfiablesProps) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const { dispositivos, cargando, error, cargar, registrar, revocar } =
    useDispositivos({
      userId: effectiveUserId,
      apiBaseUrl,
      token,
    });
  const [nombre, setNombre] = useState(Platform.OS === "web" ? "Navegador" : "Dispositivo móvil");
  const [plataforma, setPlataforma] = useState<string>(Platform.OS);
  const [fingerprint] = useState(obtenerFingerprintLocal);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  return (
    <Superficie
      nivel="container"
      redondeo="3xl"
      padding="lg"
      className="gap-6 w-full"
    >
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <Icono nombre="devices" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">
            Dispositivos confiables (CU-17)
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
          <Text className="text-on-error-container font-body-sm text-body-sm">
            {error}
          </Text>
        </View>
      )}

      {dispositivos.length === 0 && !cargando ? (
        <View className="py-8 items-center justify-center bg-surface-container/50 rounded-2xl">
          <Text className="text-on-surface-variant font-body-md text-body-md">
            Este usuario todavía no tiene dispositivos registrados.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {dispositivos.map((d) => (
            <TarjetaDispositivo
              key={d.id}
              dispositivo={d}
              onRevocar={() => revocar(d.id)}
            />
          ))}
        </View>
      )}

      <Superficie
        nivel="container-low"
        redondeo="2xl"
        padding="md"
        className="gap-4 mt-2"
      >
        <Text className="font-title-md text-title-md text-on-surface">
          Registrar este dispositivo
        </Text>
        <CampoTexto
          etiqueta="Nombre"
          valor={nombre}
          onCambio={setNombre}
          placeholder="Mi Laptop"
        />
        <CampoTexto
          etiqueta="Plataforma"
          valor={plataforma}
          onCambio={setPlataforma}
          placeholder="web / iOS / Android"
        />
        <Text className="font-body-sm text-body-sm text-on-surface-variant font-mono">
          Fingerprint detectada: {fingerprint}
        </Text>
        <BotonBancario
          titulo="Registrar y verificar este navegador"
          onPress={() => registrar(fingerprint, nombre, plataforma)}
          disabled={cargando}
        />
      </Superficie>
    </Superficie>
  );
}
