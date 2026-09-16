import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatearMoneda, enmascararCuenta } from "../utils";

export interface TarjetaSaldoProps {
  numeroCuenta: string;
  tipoCuenta: "AHORROS" | "CORRIENTE";
  saldoDisponible: number;
  moneda?: string;
}

/**
 * Tarjeta de presentación de saldo universal (Web y Móvil).
 */
export function TarjetaSaldo({
  numeroCuenta,
  tipoCuenta,
  saldoDisponible,
  moneda = "COP",
}: TarjetaSaldoProps) {
  return (
    <View style={styles.card} accessible={true} accessibilityRole="summary">
      <View style={styles.header}>
        <Text style={styles.tipo}>{tipoCuenta === "AHORROS" ? "Cuenta de Ahorros" : "Cuenta Corriente"}</Text>
        <Text style={styles.numero}>{enmascararCuenta(numeroCuenta)}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.etiqueta}>Saldo disponible</Text>
        <Text style={styles.monto}>{formatearMoneda(saldoDisponible, moneda)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tipo: {
    fontSize: 14,
    color: "#555555",
    fontWeight: "500",
  },
  numero: {
    fontSize: 14,
    color: "#777777",
    fontFamily: "monospace",
  },
  body: {
    marginTop: 4,
  },
  etiqueta: {
    fontSize: 12,
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  monto: {
    fontSize: 24,
    fontWeight: "700",
    color: "#004884",
    marginTop: 4,
  },
});
