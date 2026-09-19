/**
 * Configuración base de Tailwind compartida entre `web` (Astro) y `mobile` (Expo),
 * vía NativeWind. Contiene el tema Material Design 3 (modo oscuro) propuesto por
 * Stitch en ui-shared/plantilla.html, para que web y mobile no dupliquen la paleta.
 *
 * Cómo se usa desde las apps consumidoras:
 *
 *   // tailwind.config.cjs de `web` o `mobile`
 *   module.exports = {
 *     presets: [require("../ui-shared/tailwind.config.cjs")],
 *     content: [
 *       "./src/**\/*.{astro,tsx,ts}",              // o "./App.tsx" en mobile
 *       "../ui-shared/src/**\/*.{ts,tsx}",          // OBLIGATORIO: sin esto, Tailwind
 *                                                    // nunca ve las clases usadas dentro
 *                                                    // de los componentes de ui-shared.
 *     ],
 *   };
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0b1326",
        "on-background": "#dae2fd",

        surface: "#0b1326",
        "surface-dim": "#0b1326",
        "surface-bright": "#31394d",
        "on-surface": "#dae2fd",
        "on-surface-variant": "#c4c6cf",
        "surface-variant": "#2d3449",
        "surface-tint": "#b1c7f0",

        "surface-container-lowest": "#060e20",
        "surface-container-low": "#131b2e",
        "surface-container": "#171f33",
        "surface-container-high": "#222a3d",
        "surface-container-highest": "#2d3449",

        "inverse-surface": "#dae2fd",
        "inverse-on-surface": "#283044",
        "inverse-primary": "#495f82",

        primary: "#b1c7f0",
        "on-primary": "#193151",
        "primary-container": "#0b2545",
        "on-primary-container": "#778db2",
        "primary-fixed": "#d5e3ff",
        "primary-fixed-dim": "#b1c7f0",
        "on-primary-fixed": "#001c3b",
        "on-primary-fixed-variant": "#314769",

        secondary: "#b5c4ff",
        "on-secondary": "#00297b",
        "secondary-container": "#0159f6",
        "on-secondary-container": "#e3e7ff",
        "secondary-fixed": "#dce1ff",
        "secondary-fixed-dim": "#b5c4ff",
        "on-secondary-fixed": "#00164d",
        "on-secondary-fixed-variant": "#003cac",

        tertiary: "#ffb955",
        "on-tertiary": "#452b00",
        "tertiary-container": "#362000",
        "on-tertiary-container": "#c07e00",
        "tertiary-fixed": "#ffddb4",
        "tertiary-fixed-dim": "#ffb955",
        "on-tertiary-fixed": "#291800",
        "on-tertiary-fixed-variant": "#633f00",

        error: "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",

        outline: "#8e9098",
        "outline-variant": "#44474e",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
        gutter: "1rem",
        margin: "1.25rem",
      },
      fontFamily: {
        "headline-lg": ["Space Grotesk", "sans-serif"],
        "headline-md": ["Space Grotesk", "sans-serif"],
        "headline-sm": ["Space Grotesk", "sans-serif"],
        "headline-xl": ["Space Grotesk", "sans-serif"],
        "headline-xl-mobile": ["Space Grotesk", "sans-serif"],
        "label-caps": ["Hanken Grotesk", "sans-serif"],
        "body-lg": ["Hanken Grotesk", "sans-serif"],
        "body-md": ["Hanken Grotesk", "sans-serif"],
        "body-sm": ["Hanken Grotesk", "sans-serif"],
        "label-code": ["JetBrains Mono", "monospace"],
        "label-numeric-md": ["JetBrains Mono", "monospace"],
        "label-numeric-lg": ["JetBrains Mono", "monospace"],
      },
    },
  },
};
