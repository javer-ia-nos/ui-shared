import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { CampoTexto } from "./CampoTexto";
import { BotonBancario } from "./BotonBancario";
import { Superficie } from "./Superficie";
import { Icono } from "./Icono";
import {
  useBeneficiarios,
  type Beneficiario,
  type TipoCuentaBeneficiario,
  type TipoDocumento,
} from "../hooks/useBeneficiarios";

export interface GestionBeneficiariosProps {
  userId?: string;
  usuarioId?: string;
  apiBaseUrl?: string;
  token?: string;
}

const TIPOS_CUENTA: TipoCuentaBeneficiario[] = ["AHORROS", "CORRIENTE", "SAVINGS", "CHECKING"];
const TIPOS_DOCUMENTO: TipoDocumento[] = ["CC", "CE", "NIT", "PASAPORTE", "TI"];

function FilaOpciones<T extends string>({
  opciones,
  valor,
  onCambio,
}: {
  opciones: T[];
  valor: T;
  onCambio: (v: T) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {opciones.map((op) => (
        <Text
          key={op}
          onPress={() => onCambio(op)}
          className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm ${
            valor === op ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-low text-on-surface-variant"
          }`}
        >
          {op}
        </Text>
      ))}
    </View>
  );
}

function TarjetaBeneficiario({
  beneficiario,
  onEditar,
  onEliminar,
}: {
  beneficiario: Beneficiario;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
      <View className="flex-1">
        <Text className="font-title-md text-title-md text-on-surface">{beneficiario.alias}</Text>
        <Text className="font-body-sm text-body-sm text-on-surface-variant">
          {beneficiario.bankName} · {beneficiario.accountNumber} ({beneficiario.accountType})
        </Text>
        <Text className="font-body-sm text-body-sm text-on-surface-variant/80">
          {beneficiario.documentType} {beneficiario.documentNumber}
        </Text>
      </View>
      <View className="flex-row gap-2">
        <BotonBancario titulo="Editar" variante="secundario" onPress={onEditar} />
        <BotonBancario titulo="Eliminar" variante="peligro" onPress={onEliminar} />
      </View>
    </View>
  );
}

/** CU-03: alta, consulta, edición y eliminación de beneficiarios contra ms-cuentas. */
export function GestionBeneficiarios({ userId, usuarioId, apiBaseUrl, token }: GestionBeneficiariosProps) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const { beneficiarios, cargando, error, cargar, crear, actualizar, eliminar } = useBeneficiarios({
    userId: effectiveUserId,
    apiBaseUrl,
    token,
  });

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [alias, setAlias] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<TipoCuentaBeneficiario>("AHORROS");
  const [documentType, setDocumentType] = useState<TipoDocumento>("CC");
  const [documentNumber, setDocumentNumber] = useState("");

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  const limpiarFormulario = () => {
    setEditandoId(null);
    setAlias("");
    setBankName("");
    setAccountNumber("");
    setAccountType("AHORROS");
    setDocumentType("CC");
    setDocumentNumber("");
  };

  const cargarParaEditar = (b: Beneficiario) => {
    setEditandoId(b.id);
    setAlias(b.alias);
    setBankName(b.bankName);
    setAccountNumber(b.accountNumber);
    setAccountType(b.accountType);
    setDocumentType(b.documentType);
    setDocumentNumber(b.documentNumber);
  };

  const guardar = async () => {
    const datos = { alias, bankName, accountNumber, accountType, documentType, documentNumber };
    const ok = editandoId ? await actualizar(editandoId, datos) : await crear(datos);
    if (ok) limpiarFormulario();
  };

  return (
    <Superficie nivel="container" redondeo="3xl" padding="lg" className="gap-6 w-full">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icono nombre="person" color="#b5c4ff" />
          <Text className="font-headline-sm text-headline-sm text-on-surface">Beneficiarios (CU-03)</Text>
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
          <Text className="text-on-error-container font-body-sm text-body-sm">{error}</Text>
        </View>
      )}

      {beneficiarios.length === 0 && !cargando ? (
        <View className="py-8 items-center justify-center bg-surface-container/50 rounded-2xl">
          <Text className="text-on-surface-variant font-body-md text-body-md">
            Este usuario todavía no tiene beneficiarios registrados.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {beneficiarios.map((b) => (
            <TarjetaBeneficiario
              key={b.id}
              beneficiario={b}
              onEditar={() => cargarParaEditar(b)}
              onEliminar={() => eliminar(b.id)}
            />
          ))}
        </View>
      )}

      <Superficie nivel="container-low" redondeo="2xl" padding="md" className="gap-4">
        <Text className="font-title-md text-title-md text-on-surface">
          {editandoId ? "Editar beneficiario" : "Registrar nuevo beneficiario"}
        </Text>
        <CampoTexto etiqueta="Alias" valor={alias} onCambio={setAlias} placeholder="Mamá" />
        <CampoTexto etiqueta="Banco" valor={bankName} onCambio={setBankName} placeholder="Bancolombia" />
        <CampoTexto
          etiqueta="Número de cuenta"
          valor={accountNumber}
          onCambio={setAccountNumber}
          placeholder="1234567890"
        />
        <Text className="font-body-sm text-body-sm text-on-surface-variant -mb-1">Tipo de cuenta</Text>
        <FilaOpciones opciones={TIPOS_CUENTA} valor={accountType} onCambio={setAccountType} />
        <Text className="font-body-sm text-body-sm text-on-surface-variant -mb-1">Tipo de documento</Text>
        <FilaOpciones opciones={TIPOS_DOCUMENTO} valor={documentType} onCambio={setDocumentType} />
        <CampoTexto
          etiqueta="Número de documento"
          valor={documentNumber}
          onCambio={setDocumentNumber}
          placeholder="1000000000"
        />
        <View className="flex-row gap-2">
          <BotonBancario
            titulo={cargando ? "Guardando..." : editandoId ? "Guardar cambios" : "Registrar beneficiario"}
            onPress={guardar}
            disabled={cargando}
          />
          {editandoId && <BotonBancario titulo="Cancelar" variante="secundario" onPress={limpiarFormulario} />}
        </View>
      </Superficie>
    </Superficie>
  );
}
