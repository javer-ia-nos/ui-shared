import { useState, useCallback } from "react";
import type { LoginResultado } from "../types";

export interface UseLoginOptions {
  apiBaseUrl?: string;
  onSuccess?: (resultado: LoginResultado) => void;
  onError?: (error: string) => void;
}

/**
 * Hook headless para CU-15 (autenticación). Igual de agnóstico a la UI que
 * useTransferencia — funciona en Web y en React Native.
 */
export function useLogin(options: UseLoginOptions = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iniciarSesion = useCallback(async (): Promise<LoginResultado | undefined> => {
    if (!email || !password) {
      const msg = "Email y contraseña son requeridos";
      setError(msg);
      options.onError?.(msg);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const baseUrl = options.apiBaseUrl || "http://localhost:4863";
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || `No fue posible iniciar sesión (${res.status})`);
      }

      const resultado = body as LoginResultado;
      options.onSuccess?.(resultado);
      return resultado;
    } catch (err: any) {
      const errorMsg = err.message || "Error inesperado iniciando sesión";
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setCargando(false);
    }
  }, [email, password, options]);

  return { email, setEmail, password, setPassword, cargando, error, iniciarSesion };
}
