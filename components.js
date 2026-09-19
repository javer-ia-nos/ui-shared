// Metro (React Native) en este proyecto no resuelve subpaths vía el campo "exports"
// del package.json de forma confiable, así que además del campo "browser" (que sí
// usan Vite/Node para elegir la variante web), se publica este archivo clásico en la
// raíz del paquete: `@javer-ia-nos/ui-shared/components` resuelve aquí por
// convención de Node/Metro. `export *` (no CJS) para que Rollup detecte los named
// exports estáticamente.
export * from "./dist/components/index.js";
