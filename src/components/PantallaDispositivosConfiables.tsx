import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Icono } from "./Icono";
import type { NombreSimbolo } from "./simbolos";
import { Superficie } from "./Superficie";
import { PastillaEstado } from "./PastillaEstado";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { useDispositivos } from "../hooks/useDispositivos";
import { formatearFecha } from "../utils";
import type { Dispositivo } from "../types";

export interface PantallaDispositivosConfiablesProps {
  usuarioId: string;
  apiBaseUrl?: string;
  token?: string;
}

// Genera (y persiste en localStorage) un fingerprint estable para EL NAVEGADOR
// desde el que se prueba, imitando lo que en una app real calcularía el cliente.
function obtenerFingerprintLocal(): string {
  const clave = "javerianos_device_fingerprint";
  try {
    const existente = localStorage.getItem(clave);
    if (existente) return existente;
    const nuevo = crypto.randomUUID();
    localStorage.setItem(clave, nuevo);
    return nuevo;
  } catch {
    return crypto.randomUUID();
  }
}

function iconoPlataforma(plataforma: string | null): NombreSimbolo {
  const valor = (plataforma || "").toLowerCase();
  if (valor.includes("android") || valor.includes("ios") || valor.includes("mobile")) return "smartphone";
  if (valor.includes("web") || valor.includes("mac") || valor.includes("windows")) return "computer";
  return "devices";
}

function TarjetaDispositivo({ dispositivo, onRevocar }: { dispositivo: Dispositivo; onRevocar: (id: string) => void }) {
  const vigente = dispositivo.confianza !== null;
  return (
    <View className="bg-surface-container-high p-4 rounded-2xl flex-row items-center justify-between">
      <View className="flex-row items-center gap-3 flex-1">
        <View className="w-10 h-10 rounded-xl bg-surface-container items-center justify-center">
          <Icono nombre={iconoPlataforma(dispositivo.plataforma)} color="#b5c4ff" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="font-headline-sm text-body-md text-on-surface">
              {dispositivo.nombre || "Dispositivo sin nombre"}
            </Text>
            <PastillaEstado
              texto={vigente ? "Confiable" : "No confiable"}
              tono={vigente ? "secondary" : "neutral"}
            />
          </View>
          <Text className="font-label-code text-body-sm text-on-surface-variant">
            {dispositivo.fingerprint.slice(0, 18)}
            {vigente && dispositivo.confianza ? ` · vence ${formatearFecha(dispositivo.confianza.expiraEn)}` : ""}
          </Text>
        </View>
      </View>
      {vigente && (
        <Pressable
          onPress={() => onRevocar(dispositivo.id)}
          accessibilityRole="button"
          accessibilityLabel={`Revocar ${dispositivo.nombre || dispositivo.id}`}
          className="p-2 rounded-lg bg-surface-container active:opacity-70"
        >
          <Icono nombre="delete" color="#ffb4ab" />
        </Pressable>
      )}
    </View>
  );
}

/** CU-17: registro, consulta y revocación de dispositivos confiables. */
export function PantallaDispositivosConfiables({ usuarioId, apiBaseUrl, token }: PantallaDispositivosConfiablesProps) {
  const { dispositivos, cargando, error, cargar, registrar, revocar } = useDispositivos({
    usuarioId,
    apiBaseUrl,
    token,
  });
  const [nombre, setNombre] = useState("Navegador de prueba");
  const [plataforma, setPlataforma] = useState("web");
  const [fingerprint] = useState(obtenerFingerprintLocal);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId]);

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-6 w-full">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icono nombre="devices" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">Dispositivos confiables (CU-17)</Text>
        </View>
        <View className="bg-surface-container-high px-2 py-0.5 rounded">
          <Text className="text-secondary font-label-code text-body-sm">{dispositivos.length} registrados</Text>
        </View>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      <View className="gap-3">
        {dispositivos.length === 0 && !cargando && (
          <Text className="text-on-surface-variant font-body-sm text-body-sm">
            Este usuario todavía no tiene dispositivos registrados.
          </Text>
        )}
        {dispositivos.map((d) => (
          <TarjetaDispositivo key={d.id} dispositivo={d} onRevocar={revocar} />
        ))}
      </View>

      <View className="gap-3 pt-2 border-t border-outline-variant">
        <Text className="font-body-sm text-body-sm text-on-surface-variant">
          Registrar este navegador como dispositivo
        </Text>
        <CampoTexto etiqueta="Nombre" valor={nombre} onCambio={setNombre} />
        <CampoTexto etiqueta="Plataforma" valor={plataforma} onCambio={setPlataforma} placeholder="web / ios / android" />
        <Text className="font-label-code text-body-sm text-on-surface-variant">Fingerprint: {fingerprint}</Text>
        <BotonBancario
          titulo={cargando ? "Registrando..." : "Registrar dispositivo"}
          onPress={() => registrar(fingerprint, nombre, plataforma)}
          disabled={cargando}
        />
      </View>
    </Superficie>
  );
}
