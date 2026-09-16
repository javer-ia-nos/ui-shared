export interface Cuenta {
  id: string;
  numeroCuenta: string;
  tipoCuenta: "AHORROS" | "CORRIENTE";
  saldoDisponible: number;
  saldoTotal: number;
  moneda: string;
  estado: "ACTIVA" | "BLOQUEADA" | "INACTIVA";
}

export interface Transaccion {
  id: string;
  numeroComprobante: string;
  monto: number;
  moneda: string;
  tipo: string;
  fecha: string;
  descripcion?: string | null;
  estado: "COMPLETED" | "PENDING" | "FAILED" | "REJECTED";
}

export interface TransferenciaPayload {
  cuentaOrigen: string;
  cuentaDestino: string;
  monto: number;
  moneda?: string;
  descripcion?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
