import { useState, useEffect, useCallback } from "react";
import type { LoginResultado } from "../types";

const CLAVE_DEFAULT = "javerianos_sesion";

/**
 * Sesión de usuario compartida entre páginas: persiste en localStorage (solo en
 * este navegador, no reemplaza autenticación real de producción) para no perder
 * el login al recargar mientras se prueba.
 */
export function useSesion(clave: string = CLAVE_DEFAULT) {
  const [sesion, setSesionState] = useState<LoginResultado | null>(null);

  useEffect(() => {
    try {
      const guardada = localStorage.getItem(clave);
      if (guardada) setSesionState(JSON.parse(guardada));
    } catch {
      // localStorage no disponible (SSR/incógnito estricto): queda deslogueado.
    }
  }, [clave]);

  const iniciar = useCallback(
    (resultado: LoginResultado) => {
      setSesionState(resultado);
      try {
        localStorage.setItem(clave, JSON.stringify(resultado));
      } catch {
        /* no-op */
      }
    },
    [clave]
  );

  const cerrar = useCallback(() => {
    setSesionState(null);
    try {
      localStorage.removeItem(clave);
    } catch {
      /* no-op */
    }
  }, [clave]);

  return { sesion, iniciar, cerrar };
}
