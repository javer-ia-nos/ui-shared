import { useState, useCallback } from "react";
import { encabezadosAuth } from "../utils";

export interface UsePermisosOptions {
  userId?: string;
  usuarioId?: string;
  apiBaseUrl?: string;
  token?: string;
}

export interface PermisosUsuario {
  roles: string[];
  permissions: string[];
}

/** Hook headless para consultar roles/permisos (GET /roles/:userId/permissions), vía api-gateway. */
export function usePermisos({
  userId,
  usuarioId,
  apiBaseUrl,
  token,
}: UsePermisosOptions) {
  const effectiveUserId = userId ?? usuarioId ?? "";
  const baseUrl = apiBaseUrl ?? "/api/seguridad";
  const [permisos, setPermisos] = useState<PermisosUsuario | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!effectiveUserId) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/roles/${effectiveUserId}/permissions`, {
        headers: encabezadosAuth(token),
      });
      if (res.status === 404) {
        setPermisos(null);
        setError("No se encontró información de roles para este usuario");
        return;
      }
      if (!res.ok) {
        throw new Error(`No fue posible consultar los permisos (${res.status})`);
      }
      setPermisos((await res.json()) as PermisosUsuario);
    } catch (err: any) {
      setError(err.message || "Error inesperado consultando permisos");
    } finally {
      setCargando(false);
    }
  }, [effectiveUserId, baseUrl, token]);

  return { permisos, cargando, error, cargar };
}
