import { createPersistedStore } from "@/lib/persistedStore";

export type FontSize = 1 | 2 | 3;
export type LineWidth = "narrow" | "normal" | "wide";

export interface Prefs {
  size: FontSize;
  width: LineWidth;
}

export const DEFAULT_PREFS: Prefs = { size: 2, width: "normal" };

function parsePrefs(raw: unknown): Prefs {
  const value = (raw ?? {}) as Partial<Prefs>;
  const size = value.size === 1 || value.size === 2 || value.size === 3 ? value.size : DEFAULT_PREFS.size;
  const width =
    value.width === "narrow" || value.width === "normal" || value.width === "wide" ? value.width : DEFAULT_PREFS.width;
  return { size, width };
}

export const prefsStore = createPersistedStore<Prefs>("mdr:prefs:v1", DEFAULT_PREFS, parsePrefs);
