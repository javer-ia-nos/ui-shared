import React from "react";
// Import directo al set de MaterialIcons en vez del barrel `@expo/vector-icons`
// (que reexporta los ~15 sets de íconos y arrastra la fuente + glyphmap de todos,
// no solo el que usamos).
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import type { NombreSimbolo } from "./simbolos";

/**
 * Variante mobile de <Icono />. Traduce los nombres "Material Symbols" del mockup al
 * nombre más cercano de MaterialIcons (@expo/vector-icons) — no son pixel-idénticos,
 * pero @expo/vector-icons es nativo de Metro/Expo, sin fricción de bundler. La
 * variante web (Icono.web.tsx) usa el webfont real de Material Symbols en su lugar.
 */
const MAPA_SIMBOLOS: Record<NombreSimbolo, keyof typeof MaterialIcons.glyphMap> = {
  account_balance: "account-balance",
  account_balance_wallet: "account-balance-wallet",
  add: "add",
  add_circle: "add-circle",
  alarm: "alarm",
  arrow_forward: "arrow-forward",
  article: "article",
  assignment_turned_in: "assignment-turned-in",
  badge: "badge",
  bolt: "bolt",
  calendar_today: "calendar-today",
  category: "category",
  check_circle: "check-circle",
  chevron_right: "chevron-right",
  close: "close",
  computer: "computer",
  content_copy: "content-copy",
  credit_card: "credit-card",
  delete: "delete",
  description: "description",
  devices: "devices",
  domain: "domain",
  done_all: "done-all",
  download: "file-download",
  electric_bolt: "bolt",
  error: "error",
  event_repeat: "event-repeat",
  expand_more: "expand-more",
  flip: "flip-camera-android",
  forward_to_inbox: "forward-to-inbox",
  health_and_safety: "health-and-safety",
  lock: "lock",
  lock_clock: "lock-clock",
  lock_open: "lock-open",
  logout: "logout",
  notifications: "notifications",
  payments: "payments",
  person: "person",
  picture_as_pdf: "picture-as-pdf",
  public: "public",
  qr_code_2: "qr-code-2",
  qr_code_scanner: "qr-code-scanner",
  receipt: "receipt",
  receipt_long: "receipt-long",
  refresh: "refresh",
  savings: "savings",
  school: "school",
  security: "security",
  security_update_good: "security-update-good",
  send: "send",
  shield: "shield",
  smartphone: "smartphone",
  speed: "speed",
  support_agent: "support-agent",
  swap_horiz: "swap-horiz",
  sync: "sync",
  sync_alt: "sync-alt",
  tag: "tag",
  trending_up: "trending-up",
  tune: "tune",
  update: "update",
  verified: "verified",
  verified_user: "verified-user",
  visibility: "visibility",
  visibility_off: "visibility-off",
  wifi: "wifi",
};

export interface IconoProps {
  nombre: NombreSimbolo;
  tamaño?: number;
  color?: string;
}

export function Icono({ nombre, tamaño = 20, color = "#c4c6cf" }: IconoProps) {
  const nombreIcono = MAPA_SIMBOLOS[nombre];
  if (!nombreIcono) return null;
  return <MaterialIcons name={nombreIcono} size={tamaño} color={color} />;
}
