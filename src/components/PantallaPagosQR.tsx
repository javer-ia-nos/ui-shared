import React, { useState } from "react";
import { View, Text } from "react-native";
import { Superficie } from "./Superficie";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Icono } from "./Icono";
import { PastillaEstado } from "./PastillaEstado";
import { usePagosQR, type UsePagosQROptions } from "../hooks/usePagosQR";
import { formatearMoneda, formatearFecha } from "../utils";

export interface PantallaPagosQRProps extends UsePagosQROptions {
  cuentaId?: string;
}

/** CU-25: generación y pago de códigos QR entre cuentas, vía ms-transacciones. */
export function PantallaPagosQR({ apiBaseUrl, token, cuentaId }: PantallaPagosQRProps) {
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

  const generarQR = () => {
    if (!cuentaDestino || !comercio) return;
    generar({
      destinationAccountId: cuentaDestino,
      merchantName: comercio,
      amount: montoGenerar ? Number(montoGenerar) : undefined,
      description: descripcionGenerar || undefined,
    });
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
      <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 w-full">
        <View className="flex-row items-center gap-2">
          <Icono nombre="qr_code_2" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">Generar QR de cobro (CU-25)</Text>
        </View>

        {errorGenerar && (
          <View className="bg-error-container rounded-xl px-4 py-3">
            <Text className="text-on-error-container font-body-sm text-body-sm">{errorGenerar}</Text>
          </View>
        )}

        <CampoTexto
          etiqueta="Cuenta destino (UUID)"
          placeholder="00000000-0000-0000-0000-000000000001"
          valor={cuentaDestino}
          onCambio={setCuentaDestino}
        />
        <CampoTexto etiqueta="Nombre del comercio o receptor" placeholder="Tienda Javeriana" valor={comercio} onCambio={setComercio} />
        <CampoTexto
          etiqueta="Monto fijo (COP, opcional)"
          placeholder="Dejar vacío para monto abierto"
          valor={montoGenerar}
          onCambio={setMontoGenerar}
          teclado="numeric"
        />
        <CampoTexto
          etiqueta="Descripción (opcional)"
          placeholder="Pago de servicio"
          valor={descripcionGenerar}
          onCambio={setDescripcionGenerar}
        />

        <BotonBancario
          titulo={generando ? "Generando..." : "Generar QR"}
          onPress={generarQR}
          disabled={generando}
        />

        {qrGenerado && (
          <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-2">
            <View className="flex-row items-center gap-2">
              <PastillaEstado texto="QR generado" tono="secondary" />
              <Text className="font-body-sm text-body-sm text-on-surface-variant">
                Expira {formatearFecha(qrGenerado.expiresAt)}
              </Text>
            </View>
            <Text className="font-body-sm text-body-sm text-on-surface-variant">
              Comparte este código con quien va a pagar (no hay generador de imagen QR instalado, se comparte como texto):
            </Text>
            <Text className="font-title-md text-title-md text-primary font-mono">{qrGenerado.qrToken}</Text>
            {qrGenerado.amount != null && (
              <Text className="font-body-md text-body-md text-on-surface">
                Monto: {formatearMoneda(qrGenerado.amount, qrGenerado.currency)}
              </Text>
            )}
          </Superficie>
        )}
      </Superficie>

      {/* Pagar un QR */}
      <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-4 w-full">
        <View className="flex-row items-center gap-2">
          <Icono nombre="qr_code_scanner" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">Pagar un QR</Text>
        </View>

        {(errorDecodificar || errorPagar) && (
          <View className="bg-error-container rounded-xl px-4 py-3">
            <Text className="text-on-error-container font-body-sm text-body-sm">{errorDecodificar || errorPagar}</Text>
          </View>
        )}

        {comprobante ? (
          <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-2">
            <PastillaEstado texto="Pago realizado" tono="secondary" />
            <Text className="font-body-md text-body-md text-on-surface">
              {comprobante.merchantName} · {formatearMoneda(comprobante.amount, comprobante.currency)}
            </Text>
            <Text className="font-body-sm text-body-sm text-on-surface-variant">
              Comprobante {comprobante.numeroComprobante}
            </Text>
            <BotonBancario titulo="Pagar otro QR" variante="secundario" onPress={resetPago} />
          </Superficie>
        ) : (
          <>
            <CampoTexto
              etiqueta="Cuenta origen (UUID)"
              placeholder="00000000-0000-0000-0000-000000000002"
              valor={cuentaOrigen}
              onCambio={setCuentaOrigen}
            />
            <CampoTexto
              etiqueta="Código QR (pega el token recibido)"
              placeholder="Token del QR"
              valor={tokenQR}
              onCambio={setTokenQR}
            />

            <BotonBancario
              titulo={decodificando ? "Leyendo..." : "Leer QR"}
              variante="secundario"
              onPress={leerQR}
              disabled={decodificando || !tokenQR}
            />

            {qrDecodificado && (
              <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-2">
                {qrDecodificado.isExpired ? (
                  <PastillaEstado texto="QR expirado" tono="error" />
                ) : (
                  <PastillaEstado texto="QR vigente" tono="secondary" />
                )}
                <Text className="font-title-md text-title-md text-on-surface">{qrDecodificado.merchantName}</Text>
                {qrDecodificado.amount != null && (
                  <Text className="font-body-md text-body-md text-on-surface">
                    Monto: {formatearMoneda(qrDecodificado.amount, qrDecodificado.currency)}
                  </Text>
                )}
                {qrDecodificado.description && (
                  <Text className="font-body-sm text-body-sm text-on-surface-variant">{qrDecodificado.description}</Text>
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
                  titulo={pagando ? "Procesando..." : "Confirmar pago"}
                  onPress={confirmarPago}
                  disabled={pagando || qrDecodificado.isExpired || !qrDecodificado.valid}
                />
              </Superficie>
            )}
          </>
        )}
      </Superficie>
    </View>
  );
}
