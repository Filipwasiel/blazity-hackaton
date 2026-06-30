import { HistoryItem } from "./types";

const KEY = "oief.history.v1";
const MAX = 10;

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function persist(items: HistoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  } catch {
    // localStorage may be unavailable (private mode, quota) — fail silently.
  }
}

// Prepend an item, dedupe by id, cap at MAX, and persist. Returns the new list.
export function addHistory(item: HistoryItem): HistoryItem[] {
  const next = [item, ...loadHistory().filter((h) => h.id !== item.id)].slice(
    0,
    MAX,
  );
  persist(next);
  return next;
}

export function clearHistory(): HistoryItem[] {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }
  return [];
}
