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
