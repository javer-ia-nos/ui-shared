// Variante web del barrel de componentes: solo difiere en <Icono/> (ver Icono.web.tsx).
// Se publica aparte porque `bun build` no entiende la convención de resolución por
// plataforma (.web.tsx) que sí entienden Metro/Vite al resolver *fuente* — este
// paquete se distribuye pre-compilado, así que la variante correcta se elige por la
// condición "browser" en package.json (ver exports), no por nombre de archivo.
import "../nativewindSetup";

export { BotonBancario, type BotonBancarioProps } from "./BotonBancario";
export { TarjetaSaldo, type TarjetaSaldoProps } from "./TarjetaSaldo";
export { CampoTexto, type CampoTextoProps } from "./CampoTexto";
export { Icono, type IconoProps } from "./Icono.web";
export type { NombreSimbolo } from "./simbolos";
export { Superficie, type SuperficieProps, type NivelSuperficie } from "./Superficie";
export { PastillaEstado, type PastillaEstadoProps } from "./PastillaEstado";
export { EncabezadoApp, type EncabezadoAppProps, type ItemNavegacion } from "./EncabezadoApp";
export {
  BarraNavegacionInferior,
  type BarraNavegacionInferiorProps,
  type ItemNavegacionInferior,
} from "./BarraNavegacionInferior";
export { PiePagina } from "./PiePagina";
export {
  PantallaInicioCuentas,
  type PantallaInicioCuentasProps,
  type CuentaResumen,
  type BolsilloResumen,
  type MovimientoResumen,
  type CertificadoResumen,
} from "./PantallaInicioCuentas";
export { AccountCard, type AccountCardProps } from "./AccountCard";
export { QuickActions, type QuickActionsProps, type AccionRapida } from "./QuickActions";
export { TransactionLedger, type TransactionLedgerProps } from "./TransactionLedger";
export { SecuritySummary, type SecuritySummaryProps } from "./SecuritySummary";
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
export { DigitalReceiptPreview, type DigitalReceiptPreviewProps } from "./DigitalReceiptPreview";
export {
  PantallaTransferenciasPagos,
  type PantallaTransferenciasPagosProps,
  type DestinoTransferencia,
} from "./PantallaTransferenciasPagos";

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
export { SelectorCuenta, type SelectorCuentaProps } from "./SelectorCuenta";

// --- ms-tarjetas ---
export { DynamicCardVisual, type DynamicCardVisualProps } from "./DynamicCardVisual";
export { CashAdvanceSimulator, type CashAdvanceSimulatorProps } from "./CashAdvanceSimulator";
export { PantallaTarjetasCreditos, type PantallaTarjetasCreditosProps } from "./PantallaTarjetasCreditos";

// --- ms-crm ---
export { SupportChatPQRS, type SupportChatPQRSProps } from "./SupportChatPQRS";
export {
  PantallaInversionesSeguridadPQRS,
  type PantallaInversionesSeguridadPQRSProps,
} from "./PantallaInversionesSeguridadPQRS";
