// El barrel `index.web.ts` importa Superficie/EncabezadoApp/PiePagina/etc., y esos
// archivos hacen `import { Icono } from "./Icono"` (variante mobile, con
// @expo/vector-icons) porque en el código fuente no existe una noción de "variante
// web" por import — eso solo lo resuelve Metro/Vite en la app consumidora, no `bun
// build` al compilar este paquete. Este script usa la API de plugins de Bun para
// redirigir cualquier `./Icono` a `./Icono.web` SOLO al compilar este bundle, sin
// tocar el código fuente de cada componente.
import { plugin } from "bun";
import path from "node:path";
import { fileURLToPath } from "node:url";

// OJO: asignar NODE_ENV aquí NO basta: Bun decide el runtime de JSX (jsx vs jsxDEV)
// con el NODE_ENV que tenía el proceso al arrancar. Por eso el script `build:js:web`
// de package.json lo exporta antes de invocar bun; sin eso el bundle sale con
// `jsxDEV`, que en el build de producción de React es `undefined` y rompe la web
// con "can't access property \"call\", a is undefined".
process.env.NODE_ENV = "production";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const iconoWebPath = path.resolve(dirname, "../src/components/Icono.web.tsx");

const redirigirIconoAWeb = {
  name: "redirigir-icono-a-web",
  setup(build) {
    build.onResolve({ filter: /(^|\/)Icono$/ }, () => ({ path: iconoWebPath }));
  },
};

const resultado = await Bun.build({
  entrypoints: [path.resolve(dirname, "../src/components/index.web.ts")],
  outdir: path.resolve(dirname, "../dist/components-web"),
  naming: "index.js",
  external: ["react", "react-native", "nativewind"],
  minify: true,
  plugins: [redirigirIconoAWeb],
});

if (!resultado.success) {
  for (const log of resultado.logs) console.error(log);
  process.exit(1);
}
