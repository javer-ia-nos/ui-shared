import React, { useState } from "react";
import { View, Text } from "react-native";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { PastillaEstado } from "./PastillaEstado";
import { DynamicCardVisual } from "./DynamicCardVisual";
import { CashAdvanceSimulator } from "./CashAdvanceSimulator";
import { FormularioLimites } from "./FormularioLimites";
import { GestionBilleteras } from "./GestionBilleteras";
import { useTarjetas, type TipoTarjeta } from "../hooks/useTarjetas";
import { formatearMoneda } from "../utils";

export interface PantallaTarjetasCreditosProps {
  userId?: string;
  usuarioId?: string;
  token?: string;
}

/**
 * Pantalla universal "Tarjetas & Créditos" (spec Stitch: Bento de 3 columnas
 * — visual de tarjeta / cupo y finanzas / topes y avance). ms-tarjetas no
 * expone "listar tarjetas por usuario", así que el usuario gestiona el UUID
 * de una tarjeta que ya conoce (o que emite acá mismo).
 */
export function PantallaTarjetasCreditos({ userId, usuarioId, token }: PantallaTarjetasCreditosProps) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const {
    tarjetasConocidas,
    cupo,
    extracto,
    cargando,
    error,
    emitir,
    consultarCupo,
    consultarExtracto,
    bloquear,
    desbloquear,
    simularAvance,
  } = useTarjetas({ userId: effectiveUserId, token });

  const [tarjetaSeleccionadaId, setTarjetaSeleccionadaId] = useState("");
  const [tarjetaIdManual, setTarjetaIdManual] = useState("");
  const [cardProduct, setCardProduct] = useState("Javer-IA Black Titanium");
  const [cardType, setCardType] = useState<TipoTarjeta>("CREDITO");
  const [creditLimit, setCreditLimit] = useState("5000000");

  const tarjetaActiva = tarjetasConocidas.find((t) => t.id === tarjetaSeleccionadaId);

  const emitirTarjeta = async () => {
    const nueva = await emitir(cardProduct, cardType, cardType === "CREDITO" ? Number(creditLimit) : undefined);
    if (nueva) {
      setTarjetaSeleccionadaId(nueva.id);
      consultarCupo(nueva.id);
    }
  };

  const usarTarjetaManual = () => {
    if (!tarjetaIdManual) return;
    setTarjetaSeleccionadaId(tarjetaIdManual);
    consultarExtracto(tarjetaIdManual);
  };

  const porcentajeUso = cupo && cupo.cupoTotal > 0 ? Math.min(100, (cupo.cupoUsado / cupo.cupoTotal) * 100) : 0;

  return (
    <View className="gap-6 p-4">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="flex-row items-center gap-2">
          <View className="w-2.5 h-2.5 rounded-full bg-secondary" />
          <Text className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
            Módulo Central de Tarjetas y Líneas de Crédito
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high">
          <Icono nombre="shield" tamaño={16} color="#ffb955" />
          <Text className="font-body-sm text-body-sm text-on-surface">Cifrado bancario HSM</Text>
        </View>
      </View>

      {error && (
        <Superficie nivel="container" redondeo="2xl" padding="lg" className="bg-error-container">
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </Superficie>
      )}

      {/* Bento 3 columnas en desktop */}
      <View className="gap-6 lg:flex-row lg:items-start">
        {/* COLUMNA 1: selección/emisión + visual de tarjeta */}
        <View className="gap-4 lg:flex-1 lg:basis-5/12">
          <Superficie nivel="container-low" redondeo="3xl" padding="lg" className="gap-3">
            <Text className="font-title-md text-title-md text-on-surface">Mis tarjetas</Text>
            {tarjetasConocidas.length === 0 ? (
              <Text className="text-on-surface-variant font-body-sm text-body-sm">
                Todavía no has emitido ni cargado ninguna tarjeta en esta sesión.
              </Text>
            ) : (
              <View className="gap-2">
                {tarjetasConocidas.map((t) => (
                  <PastillaEstado
                    key={t.id}
                    texto={`${t.cardProduct} · ${t.cardNumber.slice(-4)}`}
                    tono={t.id === tarjetaSeleccionadaId ? "secondary" : "neutral"}
                  />
                ))}
              </View>
            )}
            <CampoTexto
              etiqueta="UUID de una tarjeta existente"
              placeholder="00000000-0000-0000-0000-000000000003"
              valor={tarjetaIdManual}
              onCambio={setTarjetaIdManual}
            />
            <BotonBancario titulo="Usar esta tarjeta" variante="secundario" onPress={usarTarjetaManual} disabled={!tarjetaIdManual} />
          </Superficie>

          <Superficie nivel="container-low" redondeo="3xl" padding="lg" className="gap-3">
            <Text className="font-title-md text-title-md text-on-surface">Emitir nueva tarjeta</Text>
            <CampoTexto etiqueta="Producto" valor={cardProduct} onCambio={setCardProduct} />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <BotonBancario
                  titulo="Crédito"
                  variante={cardType === "CREDITO" ? "primario" : "secundario"}
                  onPress={() => setCardType("CREDITO")}
                />
              </View>
              <View className="flex-1">
                <BotonBancario
                  titulo="Débito"
                  variante={cardType === "DEBITO" ? "primario" : "secundario"}
                  onPress={() => setCardType("DEBITO")}
                />
              </View>
            </View>
            {cardType === "CREDITO" && (
              <CampoTexto etiqueta="Cupo de crédito" valor={creditLimit} onCambio={setCreditLimit} teclado="numeric" />
            )}
            <BotonBancario
              titulo={cargando ? "Emitiendo..." : "Emitir tarjeta"}
              onPress={emitirTarjeta}
              disabled={cargando || !effectiveUserId}
            />
          </Superficie>

          {tarjetaActiva && (
            <DynamicCardVisual
              tarjeta={tarjetaActiva}
              cargando={cargando}
              onBloquear={(motivo) => bloquear(tarjetaActiva.id, motivo)}
              onDesbloquear={(motivo) => desbloquear(tarjetaActiva.id, motivo)}
            />
          )}

          <GestionBilleteras userId={effectiveUserId} token={token} />
        </View>

        {/* COLUMNA 2: cupo y finanzas */}
        <View className="gap-4 lg:flex-1 lg:basis-4/12">
          <Superficie nivel="container-low" redondeo="3xl" padding="lg" className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-headline-sm text-headline-sm text-on-surface">Cupo y Finanzas</Text>
              <View className="px-2.5 py-1 rounded-full bg-secondary-container/20">
                <Text className="font-label-code text-label-code text-secondary">Línea Rotativa</Text>
              </View>
            </View>

            {!tarjetaActiva ? (
              <Text className="text-on-surface-variant font-body-sm text-body-sm">
                Selecciona o emite una tarjeta para ver su detalle.
              </Text>
            ) : (
              <>
                <View className="flex-row flex-wrap gap-2">
                  <BotonBancario
                    titulo="Consultar cupo"
                    variante="secundario"
                    onPress={() => consultarCupo(tarjetaActiva.id)}
                    disabled={cargando || tarjetaActiva.cardType !== "CREDITO"}
                  />
                  <BotonBancario
                    titulo="Consultar extracto"
                    variante="secundario"
                    onPress={() => consultarExtracto(tarjetaActiva.id)}
                    disabled={cargando}
                  />
                </View>

                {cupo && cupo.tarjetaId === tarjetaActiva.id && (
                  <>
                    <Superficie nivel="container" redondeo="2xl" padding="md" className="gap-1">
                      <Text className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                        Cupo Total Otorgado
                      </Text>
                      <Text className="font-label-numeric-lg text-label-numeric-lg text-on-surface font-bold">
                        {formatearMoneda(cupo.cupoTotal)}
                      </Text>
                    </Superficie>
                    <View className="gap-1">
                      <View className="flex-row justify-between">
                        <Text className="font-body-sm text-body-sm text-on-surface-variant">Uso del cupo</Text>
                        <Text className="font-label-code text-label-code text-on-surface font-bold">
                          {porcentajeUso.toFixed(2)}% comprometido
                        </Text>
                      </View>
                      <View className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                        <View className="bg-secondary h-full rounded-full" style={{ width: `${porcentajeUso}%` }} />
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <Superficie nivel="container" redondeo="2xl" padding="md" className="gap-1 flex-1">
                        <Text className="font-label-caps text-[10px] uppercase text-on-surface-variant">Cupo Utilizado</Text>
                        <Text className="font-label-numeric-md text-label-numeric-md text-error font-semibold">
                          -{formatearMoneda(cupo.cupoUsado)}
                        </Text>
                      </Superficie>
                      <Superficie nivel="container" redondeo="2xl" padding="md" className="gap-1 flex-1">
                        <Text className="font-label-caps text-[10px] uppercase text-on-surface-variant">Cupo Disponible</Text>
                        <Text className="font-label-numeric-md text-label-numeric-md text-[#10B981] font-semibold">
                          {formatearMoneda(cupo.cupoDisponible)}
                        </Text>
                      </Superficie>
                    </View>
                  </>
                )}

                {extracto && extracto.tarjetaId === tarjetaActiva.id && (
                  <Superficie nivel="container" redondeo="2xl" padding="md" className="gap-2">
                    <Text className="font-title-md text-title-md text-on-surface">
                      Extracto · {extracto.totalMovimientos} movimiento{extracto.totalMovimientos === 1 ? "" : "s"}
                    </Text>
                    {extracto.movimientos.map((m) => (
                      <View key={m.id} className="flex-row justify-between border-b border-outline-variant/20 py-2">
                        <Text className="font-body-sm text-body-sm text-on-surface-variant">
                          {m.tipo} · {m.installments} cuota{m.installments === 1 ? "" : "s"}
                        </Text>
                        <Text className="font-label-numeric-md text-on-surface">{formatearMoneda(m.amount)}</Text>
                      </View>
                    ))}
                  </Superficie>
                )}
              </>
            )}
          </Superficie>
        </View>

        {/* COLUMNA 3: topes generales + avance express */}
        <View className="gap-4 lg:flex-1 lg:basis-3/12">
          <FormularioLimites userId={effectiveUserId} token={token} />
          {tarjetaActiva && tarjetaActiva.cardType === "CREDITO" && (
            <CashAdvanceSimulator
              tarjetaId={tarjetaActiva.id}
              cargando={cargando}
              onSimular={(monto, cuotas) => simularAvance(tarjetaActiva.id, monto, cuotas)}
            />
          )}
        </View>
      </View>
    </View>
  );
}
