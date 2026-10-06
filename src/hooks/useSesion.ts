import { useState, useEffect, useCallback } from "react";
import type { LoginResult } from "../types";

const CLAVE_DEFAULT = "javerianos_sesion";

/** Instante (ms) en que vence el JWT según su claim `exp`, o null si no se puede leer. */
function expiracionToken(token?: string): number | null {
  try {
    const parte = token?.split(".")[1];
    if (!parte) return null;
    const json = JSON.parse(atob(parte.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

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
        const expira = expiracionToken(parsed.token);
        if (expira !== null && expira <= Date.now()) {
          // El token ya venció (ms-seguridad emite JWT de 1h): todas las llamadas
          // darían 401, así que se descarta y se vuelve a pedir login.
          localStorage.removeItem(clave);
          return;
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

  // Cierra la sesión justo cuando vence el token, si la página sigue abierta.
  useEffect(() => {
    const expira = expiracionToken(sesion?.token);
    if (expira === null) return;
    const temporizador = setTimeout(cerrar, Math.max(0, expira - Date.now()));
    return () => clearTimeout(temporizador);
  }, [sesion, cerrar]);

  return { sesion, iniciar, cerrar };
}
