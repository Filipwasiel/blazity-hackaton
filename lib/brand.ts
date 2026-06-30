import { BrandKit } from "./types";

const KEY = "oief.brand.v1";

export function loadBrandKit(): BrandKit {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as BrandKit;
  } catch {
    return {};
  }
}

export function saveBrandKit(kit: BrandKit): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(kit));
  } catch {
    // ignore quota/private-mode errors
  }
}
