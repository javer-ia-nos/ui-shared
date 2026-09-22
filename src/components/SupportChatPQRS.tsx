import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { PastillaEstado } from "./PastillaEstado";
import { useCrm, type TipoPqrs } from "../hooks/useCrm";
import { formatearFecha } from "../utils";

export interface SupportChatPQRSProps {
  userId?: string;
  usuarioId?: string;
  token?: string;
}

const TIPOS_PQRS: TipoPqrs[] = ["PETICION", "QUEJA", "RECLAMO", "SOLICITUD"];
type ModoPQRS = "chat" | "radicar" | "disputa";

/**
 * Chat de atención + radicación de PQRS/disputas (spec Stitch: "Atención al
 * Cliente & PQRS" / "PQRS & VIRTUAL DESK") contra ms-crm real. Se omite el
 * "Turno Presencial" del mockup: no hay ningún backend real de citas/turnos
 * detrás de esa vista.
 */
export function SupportChatPQRS({ userId, usuarioId, token }: SupportChatPQRSProps) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const { mensajes, pqrsActivas, disputasActivas, cargando, error, cargarHistorial, enviarMensaje, radicarPqrs, iniciarDisputa } =
    useCrm({ userId: effectiveUserId, token });

  const [modo, setModo] = useState<ModoPQRS>("chat");
  const [mensaje, setMensaje] = useState("");
  const [tipoPqrs, setTipoPqrs] = useState<TipoPqrs>("PETICION");
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [motivoDisputa, setMotivoDisputa] = useState("");

  useEffect(() => {
    cargarHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mandar = async () => {
    const texto = mensaje;
    setMensaje("");
    await enviarMensaje(texto);
  };

  const radicar = async () => {
    if (!asunto || !descripcion) return;
    const ok = await radicarPqrs(tipoPqrs, asunto, descripcion);
    if (ok) {
      setAsunto("");
      setDescripcion("");
      setModo("chat");
    }
  };

  const disputar = async () => {
    if (!transactionId || !motivoDisputa) return;
    const ok = await iniciarDisputa(transactionId, motivoDisputa);
    if (ok) {
      setTransactionId("");
      setMotivoDisputa("");
    }
  };

  const ultimoRadicado = pqrsActivas[0] ?? disputasActivas[0];

  return (
    <Superficie nivel="container-low" redondeo="2xl" padding="lg" className="gap-4 w-full">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="p-2 rounded-lg bg-surface-container">
            <Icono nombre="support_agent" color="#ffb955" />
          </View>
          <View>
            <Text className="font-headline-sm text-headline-sm text-on-surface">Atención al Cliente & PQRS</Text>
            <Text className="font-body-sm text-body-sm text-on-surface-variant">
              Chat de atención & radicaciones oficiales
            </Text>
          </View>
        </View>
      </View>

      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      {/* Sub-tabs */}
      <View className="flex-row rounded-lg bg-surface-container p-0.5">
        {(
          [
            ["chat", "Chat de Atención"],
            ["radicar", "Radicar Solicitud"],
            ["disputa", "Disputar Transacción"],
          ] as Array<[ModoPQRS, string]>
        ).map(([valor, etiqueta]) => (
          <Pressable
            key={valor}
            onPress={() => setModo(valor)}
            className={`flex-1 py-1.5 px-2 rounded-md items-center ${modo === valor ? "bg-surface-container-high" : ""}`}
          >
            <Text className="font-body-sm text-body-sm font-semibold text-on-surface" numberOfLines={1}>
              {etiqueta}
            </Text>
          </Pressable>
        ))}
      </View>

      {modo === "chat" && (
        <View className="gap-3">
          <View className="max-h-64 gap-2 p-3 rounded-xl bg-surface-container">
            {mensajes.length === 0 ? (
              <Text className="text-on-surface-variant font-body-sm text-body-sm">
                Escríbele al asistente de atención Javer-IA para iniciar la conversación.
              </Text>
            ) : (
              mensajes.map((m) => (
                <View
                  key={m.id}
                  className={`p-2 rounded-lg max-w-[85%] ${
                    m.senderType === "CLIENTE" ? "self-end bg-primary-container" : "self-start bg-surface-container-high"
                  }`}
                >
                  <Text className="font-body-sm text-body-sm text-on-surface">{m.message}</Text>
                  <Text className="font-label-sm text-[10px] text-on-surface-variant/80 mt-1">
                    {formatearFecha(m.createdAt)}
                  </Text>
                </View>
              ))
            )}
          </View>
          <View className="flex-row gap-2 items-end">
            <View className="flex-1">
              <CampoTexto etiqueta="Mensaje" valor={mensaje} onCambio={setMensaje} placeholder="Escribe tu consulta financiera..." />
            </View>
            <BotonBancario titulo="Enviar" onPress={mandar} disabled={cargando || !mensaje.trim()} />
          </View>
        </View>
      )}

      {modo === "radicar" && (
        <View className="gap-3">
          <Text className="font-label-caps text-label-caps uppercase text-on-surface-variant">Tipo de Requerimiento</Text>
          <View className="flex-row flex-wrap gap-2">
            {TIPOS_PQRS.map((t) => (
              <Text
                key={t}
                onPress={() => setTipoPqrs(t)}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm ${
                  tipoPqrs === t ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {t}
              </Text>
            ))}
          </View>
          <CampoTexto etiqueta="Asunto" valor={asunto} onCambio={setAsunto} placeholder="Cobro no reconocido" />
          <CampoTexto
            etiqueta="Descripción del caso"
            valor={descripcion}
            onCambio={setDescripcion}
            placeholder="Detalla los hechos, montos, fecha y canal involucrado..."
          />
          <BotonBancario
            titulo={cargando ? "Radicando..." : "Generar Radicado Oficial"}
            onPress={radicar}
            disabled={cargando}
          />
        </View>
      )}

      {modo === "disputa" && (
        <View className="gap-3">
          <CampoTexto
            etiqueta="ID de la transacción (UUID)"
            valor={transactionId}
            onCambio={setTransactionId}
            placeholder="00000000-0000-0000-0000-000000000001"
          />
          <CampoTexto etiqueta="Motivo" valor={motivoDisputa} onCambio={setMotivoDisputa} placeholder="No reconozco este cobro" />
          <BotonBancario
            titulo={cargando ? "Enviando..." : "Iniciar disputa"}
            variante="secundario"
            onPress={disputar}
            disabled={cargando}
          />
        </View>
      )}

      {ultimoRadicado && (
        <View className="pt-2 border-t border-outline-variant/20">
          <Text className="font-label-caps text-label-caps uppercase text-on-surface-variant mb-2">
            Último Radicado Activo
          </Text>
          <View className="p-2 rounded-lg bg-surface-container flex-row items-center justify-between">
            <View className="flex-1 min-w-0">
              <Text className="font-label-code text-label-code text-secondary" numberOfLines={1}>
                {ultimoRadicado.id}
              </Text>
              <Text className="font-body-sm text-body-sm text-on-surface-variant" numberOfLines={1}>
                {"subject" in ultimoRadicado ? ultimoRadicado.subject : ultimoRadicado.reason}
              </Text>
            </View>
            <PastillaEstado texto={ultimoRadicado.status} tono="secondary" />
          </View>
        </View>
      )}
    </Superficie>
  );
}
