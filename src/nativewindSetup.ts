import { cssInterop } from "nativewind";
import { View, Text, Pressable, ScrollView, TextInput, Image } from "react-native";

/**
 * ui-shared se distribuye pre-compilado (bun build a dist/*.js), así que para cuando
 * Metro/Vite procesan ese código el JSX ya fue transformado a createElement() — el
 * plugin de babel de NativeWind (que transforma `<View className="...">` durante el
 * build) nunca llega a ver ese JSX original. Por eso acá se usa `cssInterop` en
 * tiempo de ejecución: le enseña directamente a los primitivos de React Native a
 * traducir la prop `className` a `style`, sin depender del pipeline de babel de la
 * app que consuma este paquete. Se importa una sola vez desde src/index.ts.
 */
cssInterop(View, { className: "style" });
cssInterop(Text, { className: "style" });
cssInterop(Pressable, { className: "style" });
cssInterop(ScrollView, { className: "style" });
cssInterop(TextInput, { className: "style" });
cssInterop(Image, { className: "style" });
