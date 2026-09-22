// Registra `className` (Tailwind/NativeWind) en los primitivos de RN antes de que
// cualquier componente de acá abajo los use. Ver src/nativewindSetup.ts.
import "../nativewindSetup";

export { BotonBancario, type BotonBancarioProps } from "./BotonBancario";
export { TarjetaSaldo, type TarjetaSaldoProps } from "./TarjetaSaldo";
export { CampoTexto, type CampoTextoProps } from "./CampoTexto";
export { Icono, type IconoProps } from "./Icono";
export type { NombreSimbolo } from "./simbolos";
export { Superficie, type SuperficieProps, type NivelSuperficie } from "./Superficie";
export { PastillaEstado, type PastillaEstadoProps } from "./PastillaEstado";
export { EncabezadoApp, type EncabezadoAppProps, type ItemNavegacion } from "./EncabezadoApp";
export { PiePagina } from "./PiePagina";
export {
  PantallaInicioCuentas,
  type PantallaInicioCuentasProps,
  type CuentaResumen,
  type BolsilloResumen,
  type MovimientoResumen,
  type CertificadoResumen,
} from "./PantallaInicioCuentas";
export { FormularioLogin, type FormularioLoginProps } from "./FormularioLogin";
export {
  PantallaDispositivosConfiables,
  type PantallaDispositivosConfiablesProps,
} from "./PantallaDispositivosConfiables";
export { FormularioLimites, type FormularioLimitesProps } from "./FormularioLimites";
export { FormularioTransferencia, type FormularioTransferenciaProps } from "./FormularioTransferencia";

// --- ms-seguridad: cambio de contraseña y permisos ---
export { FormularioCambioPassword, type FormularioCambioPasswordProps } from "./FormularioCambioPassword";
export { PastillaPermisos, type PastillaPermisosProps } from "./PastillaPermisos";

// --- ms-transacciones: QR, billeteras, pagos, transferencia internacional ---
export { PantallaPagosQR, type PantallaPagosQRProps } from "./PantallaPagosQR";
export { GestionBilleteras, type GestionBilleterasProps } from "./GestionBilleteras";
export { FormularioTransferenciaInternacional, type FormularioTransferenciaInternacionalProps } from "./FormularioTransferenciaInternacional";
export { FormularioPagoFactura, type FormularioPagoFacturaProps } from "./FormularioPagoFactura";
export { FormularioRecarga, type FormularioRecargaProps } from "./FormularioRecarga";
export { GestionPagosProgramados, type GestionPagosProgramadosProps } from "./GestionPagosProgramados";
export { FormularioPagoPresencial, type FormularioPagoPresencialProps } from "./FormularioPagoPresencial";

// --- ms-cuentas: apertura, gestión, beneficiarios, bolsillos, ahorro automático ---
export { FormularioAperturaCuenta, type FormularioAperturaCuentaProps } from "./FormularioAperturaCuenta";
export { GestionCuenta, type GestionCuentaProps } from "./GestionCuenta";
export { GestionBeneficiarios, type GestionBeneficiariosProps } from "./GestionBeneficiarios";
export { GestionBolsillos, type GestionBolsillosProps } from "./GestionBolsillos";
export { GestionAhorroAutomatico, type GestionAhorroAutomaticoProps } from "./GestionAhorroAutomatico";

// --- ms-financiero: CDT, inversiones, préstamos, posición consolidada, extractos, certificados ---
export { FormularioAperturaCDT, type FormularioAperturaCDTProps } from "./FormularioAperturaCDT";
export { FormularioInversion, type FormularioInversionProps } from "./FormularioInversion";
export { PantallaPrestamos, type PantallaPrestamosProps } from "./PantallaPrestamos";
export { PantallaPosicionConsolidada, type PantallaPosicionConsolidadaProps } from "./PantallaPosicionConsolidada";
export { PantallaExtracto, type PantallaExtractoProps } from "./PantallaExtracto";
export { ValidadorCertificado, type ValidadorCertificadoProps } from "./ValidadorCertificado";
