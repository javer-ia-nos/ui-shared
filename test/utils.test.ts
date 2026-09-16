import { describe, expect, it } from "bun:test";
import {
  formatearMoneda,
  validarNumeroCuenta,
  enmascararCuenta,
} from "../src/utils";

describe("ui-shared: Utilidades financieras", () => {
  it("Debe formatear valores a moneda colombiana (COP)", () => {
    const formatted = formatearMoneda(1500000);
    expect(formatted).toContain("1.500.000");
  });

  it("Debe validar correctamente números de cuenta (8 a 16 dígitos numéricos)", () => {
    expect(validarNumeroCuenta("12345678")).toBe(true);
    expect(validarNumeroCuenta("1234567890123456")).toBe(true);
    expect(validarNumeroCuenta("1234")).toBe(false); // muy corto
    expect(validarNumeroCuenta("12345678abc")).toBe(false); // caracteres no numéricos
  });

  it("Debe enmascarar número de cuenta mostrando solo los últimos 4 dígitos", () => {
    expect(enmascararCuenta("9876543210")).toBe("**** 3210");
    expect(enmascararCuenta("1234")).toBe("1234");
  });
});
