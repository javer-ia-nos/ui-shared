# @javer-ia-nos/ui-shared

Librería compartida de componentes universales, hooks headless, utilidades y tipos DTO para el **Sistema Bancario** (Javer-IA-nos).

Compatible directamente con la aplicación **Web (Astro + React)** y la aplicación **Mobile (React Native / Expo)**.

---

## 📦 Instalación con Bun

Al instalarse directamente desde GitHub, **no necesitas tokens de paquetes ni cuentas especiales**:

```bash
bun add github:javer-ia-nos/ui-shared
```

Para actualizar a la última versión en cualquier momento:
```bash
bun update @javer-ia-nos/ui-shared
```

---

## 📁 Estructura del Paquete

```
src/
├── types/         # Tipos e interfaces DTO compartidos (Cuenta, Transaccion, etc.)
├── utils/         # Funciones puras (formatearMoneda, enmascararCuenta, etc.)
├── hooks/         # Lógica reactiva Headless (useTransferencia, useSaldo, etc.)
├── components/    # Componentes universales React Native (BotonBancario, TarjetaSaldo)
└── index.ts       # Entrypoint principal
```

---

## 🚀 Ejemplos de Uso

### 1. Hook Headless (`useTransferencia`) — Web o Mobile
La lógica de validación, estados y llamada HTTP no toca el DOM ni vistas nativas:

```tsx
import { useTransferencia } from "@javer-ia-nos/ui-shared";

export function FormularioTransferencia() {
  const {
    cuentaOrigen,
    setCuentaOrigen,
    cuentaDestino,
    setCuentaDestino,
    monto,
    setMonto,
    cargando,
    error,
    exito,
    ejecutarTransferencia
  } = useTransferencia({
    apiBaseUrl: "http://localhost:4862",
    onSuccess: (data) => console.log("Comprobante:", data.numeroComprobante),
  });

  return (
    // Usa JSX web o componentes de React Native indistintamente
  );
}
```

### 2. Componentes Universales UI (`BotonBancario`, `TarjetaSaldo`)
Construidos con primitivas estándar de React Native (`View`, `Text`, `Pressable`, `StyleSheet`):

- **En Mobile (React Native)**: Renderiza directo a vistas nativas de iOS y Android.
- **En Web (Astro con React)**: Renderiza a elementos web mediante `react-native-web`.

```tsx
import { BotonBancario, TarjetaSaldo } from "@javer-ia-nos/ui-shared";

<TarjetaSaldo
  numeroCuenta="123456789012"
  tipoCuenta="AHORROS"
  saldoDisponible={4500000}
/>

<BotonBancario
  titulo="Confirmar Transferencia"
  variante="primario"
  onPress={() => console.log("Presionado")}
/>
```

---

## 🛠️ Desarrollo y Tests

```bash
bun install        # Instalar dependencias locales
bun test           # Ejecutar suite de pruebas unitarias
bun run typecheck  # Comprobación de TypeScript estricto
```

