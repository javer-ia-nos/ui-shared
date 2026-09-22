import React, { useState } from "react";
import { View, Text } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { PastillaEstado } from "./PastillaEstado";
import { useCertificadosExtra, type UseCertificadosExtraOptions } from "../hooks/useCertificadosExtra";
import { formatearFecha } from "../utils";

export interface ValidadorCertificadoProps extends UseCertificadosExtraOptions {}

/** CU-10: validación pública de un certificado por su código de verificación. */
export function ValidadorCertificado(props: ValidadorCertificadoProps) {
  const { resultado, cargando, error, validar } = useCertificadosExtra(props);
  const [codigo, setCodigo] = useState("");

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 w-full">
      <View className="flex-row items-center gap-2">
        <Icono nombre="verified" color="#b5c4ff" />
        <Text className="font-headline-sm text-headline-sm text-on-surface">Validar certificado (CU-10)</Text>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      <CampoTexto
        etiqueta="Código de verificación"
        valor={codigo}
        onCambio={setCodigo}
        placeholder="CERT-2026-XXXXXX"
      />

      <BotonBancario
        titulo={cargando ? "Validando..." : "Validar certificado"}
        onPress={() => validar(codigo)}
        disabled={cargando || !codigo}
      />

      {resultado && (
        <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-2">
          <View className="flex-row items-center gap-2">
            <PastillaEstado
              texto={resultado.valido ? "Válido" : "No válido"}
              tono={resultado.valido ? "secondary" : "error"}
            />
          </View>
          <Text className="font-body-sm text-body-sm text-on-surface-variant">{resultado.mensaje}</Text>
          {resultado.certificado && (
            <View className="gap-1 mt-1">
              <Text className="font-body-md text-body-md text-on-surface">
                {resultado.certificado.tipoCertificado} · {resultado.certificado.destinatario}
              </Text>
              <Text className="font-body-sm text-body-sm text-on-surface-variant">
                Emitido {formatearFecha(resultado.certificado.fechaEmision)} · Vence{" "}
                {formatearFecha(resultado.certificado.fechaVencimiento)}
              </Text>
              <PastillaEstado texto={resultado.certificado.estado} tono="neutral" />
            </View>
          )}
        </Superficie>
      )}
    </Superficie>
  );
}
