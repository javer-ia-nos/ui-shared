/**
 * Formatea un valor numérico a moneda colombiana (COP) o especificada.
 */
export function formatearMoneda(valor: number, moneda: string = "COP"): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
}

/**
 * Formatea una fecha ISO a formato local legible.
 */
export function formatearFecha(fechaIso: string): string {
  const fecha = new Date(fechaIso);
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

/**
 * Valida si un texto cumple con formato de número de cuenta válido.
 */
export function validarNumeroCuenta(cuenta: string): boolean {
  return /^\d{8,16}$/.test(cuenta.trim());
}

/**
 * Ofusca un número de cuenta mostrando solo los últimos 4 dígitos.
 */
export function enmascararCuenta(cuenta: string): string {
  const limpia = cuenta.trim();
  if (limpia.length <= 4) return limpia;
  return `**** ${limpia.slice(-4)}`;
}
