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
