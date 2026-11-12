import { createPersistedStore } from "@/lib/persistedStore";

export interface HistoryEntry {
  id: string;
  name: string;
  content: string;
  openedAt: number;
}

export const HISTORY_LIMIT = 10;

const EMPTY: HistoryEntry[] = [];

function isEntry(item: unknown): item is HistoryEntry {
  if (typeof item !== "object" || item === null) {
    return false;
  }
  const value = item as Partial<HistoryEntry>;
  return typeof value.id === "string" && typeof value.name === "string" && typeof value.content === "string";
}

function parseHistory(raw: unknown): HistoryEntry[] {
  return Array.isArray(raw) ? raw.filter(isEntry).slice(0, HISTORY_LIMIT) : EMPTY;
}

export const historyStore = createPersistedStore<HistoryEntry[]>("mdr:history:v1", EMPTY, parseHistory);

export function addToHistory(name: string, content: string): HistoryEntry {
  const entry: HistoryEntry = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    name,
    content,
    openedAt: Date.now(),
  };
  const rest = historyStore.getSnapshot().filter((item) => item.name !== name);
  historyStore.set([entry, ...rest].slice(0, HISTORY_LIMIT));
  return entry;
}

export function clearHistory(): void {
  historyStore.set(EMPTY);
}
