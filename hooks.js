// Ver comentario en components.js — mismo motivo (Metro no resuelve el paquete sin
// esto). Se usa `export *` (no `module.exports = require(...)`) porque Rollup/Vite
// no logran detectar estáticamente los named exports a través de un re-export CJS.
export * from "./dist/hooks/index.js";
