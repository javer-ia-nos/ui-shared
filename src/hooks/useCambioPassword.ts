import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export interface UseCambioPasswordOptions {
  userId?: string;
  usuarioId?: string;
  apiBaseUrl?: string;
  token?: string;
}

/** Hook headless para cambio de contraseña (PUT /security/password), vía api-gateway. */
export function useCambioPassword({
  userId,
  usuarioId,
  apiBaseUrl,
  token,
}: UseCambioPasswordOptions) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const baseUrl = apiBaseUrl ?? "/api/seguridad";
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const reset = useCallback(() => {
    setPasswordActual("");
    setPasswordNueva("");
    setError(null);
    setExito(false);
  }, []);

  const cambiar = useCallback(async (): Promise<boolean> => {
    if (!effectiveUserId) {
      setError("No hay usuario autenticado");
      return false;
    }
    if (!passwordActual || !passwordNueva) {
      setError("La contraseña actual y la nueva son requeridas");
      return false;
    }
    if (passwordNueva.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return false;
    }

    setCargando(true);
    setError(null);
    setExito(false);
    try {
      const res = await fetch(`${baseUrl}/security/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...encabezadosAuth(token),
        },
        body: JSON.stringify({
          userId: effectiveUserId,
          currentPassword: passwordActual,
          newPassword: passwordNueva,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || `No fue posible cambiar la contraseña (${res.status})`);
      }
      setExito(true);
      setPasswordActual("");
      setPasswordNueva("");
      return true;
    } catch (err: any) {
      setError(err.message || "Error inesperado cambiando la contraseña");
      return false;
    } finally {
      setCargando(false);
    }
  }, [effectiveUserId, baseUrl, token, passwordActual, passwordNueva]);

  return {
    passwordActual,
    setPasswordActual,
    passwordNueva,
    setPasswordNueva,
    cargando,
    error,
    exito,
    cambiar,
    reset,
  };
}
