import { useState, useEffect, useCallback } from "react";
import type { LoginResult } from "../types";

const CLAVE_DEFAULT = "javerianos_sesion";

/**
 * Sesión de usuario compartida entre páginas: persiste en localStorage (solo en
 * este navegador, no reemplaza autenticación real de producción) para no perder
 * el login al recargar mientras se prueba.
 */
export function useSesion(clave: string = CLAVE_DEFAULT) {
  const [sesion, setSesionState] = useState<LoginResult | null>(null);

  useEffect(() => {
    try {
      const guardada = localStorage.getItem(clave);
      if (guardada) {
        const parsed = JSON.parse(guardada);
        if (parsed.usuario && !parsed.user) {
          parsed.user = {
            id: parsed.usuario.id,
            email: parsed.usuario.email,
            role: parsed.usuario.rol,
          };
        }
        setSesionState(parsed);
      }
    } catch {
      // localStorage no disponible (SSR/incógnito estricto): queda deslogueado.
    }
  }, [clave]);

  const iniciar = useCallback(
    (resultado: LoginResult) => {
      const normalized: LoginResult = {
        token: resultado.token,
        user: (resultado as any).user ?? {
          id: (resultado as any).usuario?.id,
          email: (resultado as any).usuario?.email,
          role: (resultado as any).usuario?.rol ?? "client",
        },
      };
      setSesionState(normalized);
      try {
        localStorage.setItem(clave, JSON.stringify(normalized));
      } catch {
        /* no-op */
      }
    },
    [clave],
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
