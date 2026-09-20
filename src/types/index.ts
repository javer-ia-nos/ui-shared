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

// --- ms-seguridad ---

export interface UsuarioSesion {
  id: string;
  email: string;
  rol: string;
}

export interface LoginResultado {
  token: string;
  usuario: UsuarioSesion;
}

// CU-17: estado de confianza vigente de un dispositivo (null = nunca se
// estableció, fue revocada, o venció).
export interface DispositivoConfianza {
  confiable: boolean;
  verificadoEn: string;
  expiraEn: string;
}

export interface Dispositivo {
  id: string;
  usuarioId: string;
  fingerprint: string;
  nombre: string | null;
  plataforma: string | null;
  registradoEn: string;
  activo: boolean;
  confianza: DispositivoConfianza | null;
}

export interface LimitesTransaccion {
  usuarioId: string;
  limiteDiario: number;
  limitePorOperacion: number;
}
