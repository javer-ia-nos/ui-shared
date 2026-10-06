import React, { useState, useEffect } from "react";
import { View, Text, Image, Pressable } from "react-native";
import QRCode from "qrcode";
import { Superficie } from "./Superficie";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Icono } from "./Icono";
import { PastillaEstado } from "./PastillaEstado";
import { SelectorCuenta } from "./SelectorCuenta";
import { usePagosQR, type UsePagosQROptions } from "../hooks/usePagosQR";
import { formatearMoneda, formatearFecha } from "../utils";

export interface PantallaPagosQRProps extends UsePagosQROptions {
  cuentaId?: string;
}

/** CU-25: generación y pago de códigos QR entre cuentas, vía ms-transacciones. */
export function PantallaPagosQR({
  apiBaseUrl,
  token,
  cuentaId,
}: PantallaPagosQRProps) {
  const {
    generando,
    errorGenerar,
    qrGenerado,
    generar,
    decodificando,
    errorDecodificar,
    qrDecodificado,
    decodificar,
    pagando,
    errorPagar,
    comprobante,
    pagar,
    resetPago,
  } = usePagosQR({ apiBaseUrl, token });

  // --- Generar QR de cobro ---
  const [cuentaDestino, setCuentaDestino] = useState(cuentaId ?? "");
  const [comercio, setComercio] = useState("");
  const [montoGenerar, setMontoGenerar] = useState("");
  const [descripcionGenerar, setDescripcionGenerar] = useState("");
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Estados visuales del QR generado
  const [qrImagenUrl, setQrImagenUrl] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Generación reactiva del código QR en imagen / dataURL
  useEffect(() => {
    let activo = true;
    if (qrGenerado?.qrToken) {
      QRCode.toDataURL(qrGenerado.qrToken, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0b2545",
          light: "#ffffff",
        },
      })
        .then((url) => {
          if (activo) setQrImagenUrl(url);
        })
        .catch((err) => {
          console.error("Error al renderizar el gráfico QR:", err);
        });
    } else {
      setQrImagenUrl(null);
    }
    return () => {
      activo = false;
    };
  }, [qrGenerado?.qrToken]);

  const generarQR = () => {
    setErrorValidacion(null);
    if (!cuentaDestino) {
      setErrorValidacion(
        "Por favor selecciona la cuenta destino que recibirá los fondos.",
      );
      return;
    }
    if (!comercio.trim()) {
      setErrorValidacion(
        "Por favor ingresa el nombre del comercio o concepto de cobro.",
      );
      return;
    }

    generar({
      destinationAccountId: cuentaDestino,
      merchantName: comercio.trim(),
      amount: montoGenerar ? Number(montoGenerar) : undefined,
      description: descripcionGenerar.trim() || undefined,
    });
  };

  const copiarToken = async () => {
    if (!qrGenerado?.qrToken) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(qrGenerado.qrToken);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      }
    } catch {
      // Ignorar fallo de portapapeles en entornos restringidos
    }
  };

  const descargarQR = () => {
    if (!qrImagenUrl) return;
    if (typeof document !== "undefined") {
      const link = document.createElement("a");
      link.href = qrImagenUrl;
      const slug = (qrGenerado?.merchantName || "Cobro").replace(/\s+/g, "_");
      link.download = `QR_${slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // --- Pagar un QR ---
  const [cuentaOrigen, setCuentaOrigen] = useState(cuentaId ?? "");
  const [tokenQR, setTokenQR] = useState("");
  const [montoPagar, setMontoPagar] = useState("");
  const [descripcionPagar, setDescripcionPagar] = useState("");

  const leerQR = () => {
    if (!tokenQR) return;
    decodificar(tokenQR);
  };

  const transferirAPago = () => {
    if (!qrGenerado?.qrToken) return;
    setTokenQR(qrGenerado.qrToken);
    decodificar(qrGenerado.qrToken);
  };

  const confirmarPago = () => {
    if (!cuentaOrigen || !tokenQR) return;
    pagar({
      sourceAccountId: cuentaOrigen,
      qrToken: tokenQR,
      amount: montoPagar ? Number(montoPagar) : undefined,
      description: descripcionPagar || undefined,
    });
  };

  return (
    <View className="gap-6">
      {/* Generar QR de cobro */}
      <Superficie
        nivel="container"
        redondeo="3xl"
        padding="lg"
        className="gap-4 w-full"
      >
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <View className="flex-row items-center gap-2">
            <Icono nombre="qr_code_2" color="#b5c4ff" />
            <Text className="font-headline-sm text-headline-sm text-on-surface">
              Generar QR de Cobro (CU-25)
            </Text>
          </View>
          <PastillaEstado texto="Generador Web Activo" tono="secondary" />
        </View>

        {(errorGenerar || errorValidacion) && (
          <View className="bg-error-container rounded-xl px-4 py-3">
            <Text className="text-on-error-container font-body-sm text-body-sm">
              {errorGenerar || errorValidacion}
            </Text>
          </View>
        )}

        <SelectorCuenta
          etiqueta="Cuenta destino (recibe el cobro)"
          token={token}
          onResuelta={(c) => {
            setCuentaDestino(c.id);
            setErrorValidacion(null);
          }}
        />

        <CampoTexto
          etiqueta="Nombre del comercio o receptor"
          placeholder="Ej: Café Javeriano Central"
          valor={comercio}
          onCambio={(v) => {
            setComercio(v);
            setErrorValidacion(null);
          }}
        />

        <CampoTexto
          etiqueta="Monto fijo (COP, opcional)"
          placeholder="Dejar vacío para monto abierto"
          valor={montoGenerar}
          onCambio={setMontoGenerar}
          teclado="numeric"
        />

        <CampoTexto
          etiqueta="Descripción del cobro (opcional)"
          placeholder="Ej: Pago de almuerzo ejecutivo"
          valor={descripcionGenerar}
          onCambio={setDescripcionGenerar}
        />

        <BotonBancario
          titulo={generando ? "Generando Código QR..." : "Generar Código QR"}
          onPress={generarQR}
          disabled={generando}
        />

        {qrGenerado && (
          <Superficie
            nivel="container-low"
            redondeo="2xl"
            padding="lg"
            className="gap-4 items-center border border-outline-variant/40 mt-2"
          >
            <View className="flex-row flex-wrap items-center justify-between w-full gap-2">
              <View className="flex-row items-center gap-2">
                <PastillaEstado texto="Código QR Generado" tono="secondary" />
                <Text className="font-body-sm text-body-sm text-on-surface-variant">
                  Expira {formatearFecha(qrGenerado.expiresAt)}
                </Text>
              </View>
              {qrGenerado.amount != null ? (
                <PastillaEstado
                  texto={formatearMoneda(
                    qrGenerado.amount,
                    qrGenerado.currency,
                  )}
                  tono="tertiary"
                />
              ) : (
                <PastillaEstado texto="Monto Abierto" tono="neutral" />
              )}
            </View>

            {/* Recuadro visual del código QR con fondo blanco de alto contraste */}
            <View className="bg-white p-4 rounded-2xl items-center justify-center shadow-md border border-neutral-200">
              {qrImagenUrl ? (
                <Image
                  source={{ uri: qrImagenUrl }}
                  style={{ width: 220, height: 220 }}
                  resizeMode="contain"
                  accessibilityLabel={`Código QR de cobro para ${qrGenerado.merchantName}`}
                />
              ) : (
                <View className="w-[220px] h-[220px] items-center justify-center gap-2">
                  <Icono nombre="qr_code_2" tamaño={40} color="#0b2545" />
                  <Text className="font-body-sm text-body-sm text-neutral-600">
                    Dibujando QR...
                  </Text>
                </View>
              )}
            </View>

            <View className="items-center gap-1 w-full">
              <Text className="font-title-lg text-title-lg text-on-surface font-semibold text-center">
                {qrGenerado.merchantName}
              </Text>
              {qrGenerado.description && (
                <Text className="font-body-sm text-body-sm text-on-surface-variant text-center">
                  {qrGenerado.description}
                </Text>
              )}
              <Text className="font-label-code text-label-code text-tertiary text-center">
                Firma criptográfica HMAC-SHA256 · Estándar CU-25
              </Text>
            </View>

            {/* Acciones principales del QR */}
            <View className="flex-row flex-wrap gap-2 justify-center w-full pt-1">
              <BotonBancario
                titulo={copiado ? "✓ ¡Token Copiado!" : "Copiar Token"}
                variante="secundario"
                onPress={copiarToken}
              />
              <BotonBancario
                titulo="Descargar Imagen QR"
                variante="secundario"
                onPress={descargarQR}
              />
              <BotonBancario
                titulo="Cargar en Sección de Pago ↓"
                onPress={transferirAPago}
              />
            </View>

            {/* Token textual para verificación y auditoría */}
            <View className="w-full bg-surface-container p-3 rounded-xl gap-1">
              <Text className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                Token del Código QR (Firmado Criptográficamente)
              </Text>
              <Text
                className="font-mono text-body-sm text-primary select-all break-all"
                numberOfLines={2}
              >
                {qrGenerado.qrToken}
              </Text>
            </View>
          </Superficie>
        )}
      </Superficie>

      {/* Pagar un QR */}
      <Superficie
        nivel="container"
        redondeo="3xl"
        padding="lg"
        className="gap-4 w-full"
      >
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <View className="flex-row items-center gap-2">
            <Icono nombre="qr_code_scanner" color="#b5c4ff" />
            <Text className="font-headline-sm text-headline-sm text-on-surface">
              Pagar un QR
            </Text>
          </View>
          <View className="px-2.5 py-0.5 rounded-full bg-surface-container-high">
            <Text className="font-label-code text-label-code text-on-surface-variant">
              Lectura por Token Digital
            </Text>
          </View>
        </View>

        <Text className="font-body-sm text-body-sm text-on-surface-variant">
          Pega el token del código QR generado para procesar el débito inmediato
          (el escaneo óptico por cámara física se habilitará en una versión
          posterior).
        </Text>

        {(errorDecodificar || errorPagar) && (
          <View className="bg-error-container rounded-xl px-4 py-3">
            <Text className="text-on-error-container font-body-sm text-body-sm">
              {errorDecodificar || errorPagar}
            </Text>
          </View>
        )}

        {comprobante ? (
          <Superficie
            nivel="container-low"
            redondeo="2xl"
            padding="md"
            className="gap-2"
          >
            <PastillaEstado texto="Pago realizado" tono="secondary" />
            <Text className="font-body-md text-body-md text-on-surface">
              {comprobante.merchantName} ·{" "}
              {formatearMoneda(comprobante.amount, comprobante.currency)}
            </Text>
            <Text className="font-body-sm text-body-sm text-on-surface-variant">
              Comprobante {comprobante.numeroComprobante}
            </Text>
            <BotonBancario
              titulo="Pagar otro QR"
              variante="secundario"
              onPress={resetPago}
            />
          </Superficie>
        ) : (
          <>
            <SelectorCuenta
              etiqueta="Cuenta origen (paga)"
              token={token}
              onResuelta={(c) => setCuentaOrigen(c.id)}
            />
            <CampoTexto
              etiqueta="Código QR (pega el token recibido)"
              placeholder="Token criptográfico del QR"
              valor={tokenQR}
              onCambio={setTokenQR}
            />

            <BotonBancario
              titulo={
                decodificando ? "Validando Token..." : "Leer y Decodificar QR"
              }
              variante="secundario"
              onPress={leerQR}
              disabled={decodificando || !tokenQR}
            />

            {qrDecodificado && (
              <Superficie
                nivel="container-low"
                redondeo="2xl"
                padding="md"
                className="gap-2"
              >
                {qrDecodificado.isExpired ? (
                  <PastillaEstado texto="QR expirado" tono="error" />
                ) : (
                  <PastillaEstado
                    texto="QR vigente y verificado"
                    tono="secondary"
                  />
                )}
                <Text className="font-title-md text-title-md text-on-surface">
                  {qrDecodificado.merchantName}
                </Text>
                {qrDecodificado.amount != null && (
                  <Text className="font-body-md text-body-md text-on-surface">
                    Monto:{" "}
                    {formatearMoneda(
                      qrDecodificado.amount,
                      qrDecodificado.currency,
                    )}
                  </Text>
                )}
                {qrDecodificado.description && (
                  <Text className="font-body-sm text-body-sm text-on-surface-variant">
                    {qrDecodificado.description}
                  </Text>
                )}

                {!qrDecodificado.amount && (
                  <CampoTexto
                    etiqueta="Monto a pagar (COP)"
                    placeholder="50000"
                    valor={montoPagar}
                    onCambio={setMontoPagar}
                    teclado="numeric"
                  />
                )}
                <CampoTexto
                  etiqueta="Descripción (opcional)"
                  placeholder="Pago QR"
                  valor={descripcionPagar}
                  onCambio={setDescripcionPagar}
                />

                <BotonBancario
                  titulo={
                    pagando ? "Procesando pago..." : "Confirmar y Pagar QR"
                  }
                  onPress={confirmarPago}
                  disabled={
                    pagando || qrDecodificado.isExpired || !qrDecodificado.valid
                  }
                />
              </Superficie>
            )}
          </>
        )}
      </Superficie>
    </View>
  );
}
