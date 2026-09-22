export { useTransferencia, type UseTransferenciaOptions } from "./useTransferencia";
export { useLogin, type UseLoginOptions } from "./useLogin";
export { useDispositivos, type UseDispositivosOptions } from "./useDispositivos";
export { useLimites, type UseLimitesOptions } from "./useLimites";
export { useInicioCuentas, type UseInicioCuentasOptions } from "./useInicioCuentas";
export { useSesion } from "./useSesion";

// --- ms-seguridad ---
export { useCambioPassword, type UseCambioPasswordOptions } from "./useCambioPassword";
export { usePermisos, type UsePermisosOptions, type PermisosUsuario } from "./usePermisos";

// --- ms-transacciones ---
export { usePagosQR, type UsePagosQROptions } from "./usePagosQR";
export { useBilleteras, type UseBilleterasOptions } from "./useBilleteras";
export { useTransferenciaInternacional, type UseTransferenciaInternacionalOptions } from "./useTransferenciaInternacional";
export { usePagoFactura, type UsePagoFacturaOptions } from "./usePagoFactura";
export { useRecarga, type UseRecargaOptions, type OperadorMovil } from "./useRecarga";
export { usePagosProgramados, type UsePagosProgramadosOptions, type FrecuenciaPago, type PagoProgramado } from "./usePagosProgramados";
export { usePagoPresencial, type UsePagoPresencialOptions, type TipoOperacionPresencial, type TransaccionFisicaResultado } from "./usePagoPresencial";

// --- ms-cuentas ---
export { useAperturaCuenta, type UseAperturaCuentaOptions, type TipoCuenta, type Moneda, type CotitularInput, type CuentaAbierta } from "./useAperturaCuenta";
export { useGestionCuenta, type UseGestionCuentaOptions, type EstadoCuenta } from "./useGestionCuenta";
export { useBeneficiarios, type UseBeneficiariosOptions, type Beneficiario, type DatosBeneficiario, type TipoCuentaBeneficiario, type TipoDocumento } from "./useBeneficiarios";
export { useBolsillos, type UseBolsillosOptions, type Subcuenta, type ResumenSubcuentas } from "./useBolsillos";
export { useAhorroAutomatico, type UseAhorroAutomaticoOptions, type ReglaAhorroAutomatico, type FrecuenciaAhorro } from "./useAhorroAutomatico";

// --- ms-financiero ---
export { useCDT, type UseCDTOptions, type ProductoFinanciero } from "./useCDT";
export { useInversiones, type UseInversionesOptions, type Rendimiento } from "./useInversiones";
export { usePrestamos, type UsePrestamosOptions, type CuotaPrestamo, type Prestamo } from "./usePrestamos";
export { usePosicionConsolidada, type UsePosicionConsolidadaOptions } from "./usePosicionConsolidada";
export { useExtractoCuenta, type UseExtractoCuentaOptions } from "./useExtractoCuenta";
export { useCertificadosExtra, type UseCertificadosExtraOptions } from "./useCertificadosExtra";
export { useResolverCuenta, type UseResolverCuentaOptions, type CuentaResuelta } from "./useResolverCuenta";

// --- ms-tarjetas ---
export {
  useTarjetas,
  type UseTarjetasOptions,
  type Tarjeta,
  type TipoTarjeta,
  type EstadoTarjeta,
  type CupoTarjeta,
  type ExtractoTarjeta,
  type MovimientoTarjeta,
} from "./useTarjetas";

// --- ms-crm ---
export {
  useCrm,
  type UseCrmOptions,
  type MensajeChat,
  type RemitenteChat,
  type Pqrs,
  type TipoPqrs,
  type Disputa,
} from "./useCrm";
