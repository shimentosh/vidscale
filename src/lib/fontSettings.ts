const STORAGE_KEY_API = "vidscale-fonts-google-api-key";
const STORAGE_KEY_CACHED = "vidscale-fonts-cached-google";
const STORAGE_KEY_CUSTOM = "vidscale-fonts-custom";
const HEAD_ID = "vidscale-google-fonts-link";

export type CustomFontVariant = {
  id: string;
  label: string;
  weight?: string;
  style?: string;
  url: string;
};

export type CustomFont = {
  id: string;
  familyName: string;
  variants: CustomFontVariant[];
};

export function getGoogleFontsApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY_API) ?? "";
}

export function setGoogleFontsApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_API, key);
}

export function getCachedGoogleFonts(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CACHED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function setCachedGoogleFonts(families: string[]): void {
  localStorage.setItem(STORAGE_KEY_CACHED, JSON.stringify(families));
  injectGoogleFonts();
}

function migrateLegacyCustomFont(x: unknown): CustomFont | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (o.id && o.familyName && Array.isArray(o.variants)) {
    return {
      id: String(o.id),
      familyName: String(o.familyName),
      variants: (o.variants as CustomFontVariant[]).filter(
        (v) => v && v.id && v.label && typeof v.url === "string"
      ),
    };
  }
  if (typeof o.name === "string") {
    const url = typeof o.url === "string" ? o.url : undefined;
    return {
      id: crypto.randomUUID(),
      familyName: o.name,
      variants: url ? [{ id: crypto.randomUUID(), label: "Regular", url }] : [],
    };
  }
  return null;
}

export function getCustomFonts(): CustomFont[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const result: CustomFont[] = [];
    for (const x of parsed) {
      const font = migrateLegacyCustomFont(x);
      if (font) result.push(font);
    }
    return result;
  } catch {
    return [];
  }
}

export function setCustomFonts(fonts: CustomFont[]): void {
  localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(fonts));
  injectCustomFonts();
}

/** Inject <link> tags for all cached Google font families so the browser loads and caches them. */
export function injectGoogleFonts(): void {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(HEAD_ID);
  if (existing) existing.remove();

  const families = getCachedGoogleFonts();
  if (families.length === 0) return;

  const familyParam = families
    .map((f) => `family=${encodeURIComponent(f.replace(/ /g, "+"))}:wght@300;400;500;600;700`)
    .join("&");
  const href = `https://fonts.googleapis.com/css2?${familyParam}&display=swap`;

  const link = document.createElement("link");
  link.id = HEAD_ID;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/** Inject @font-face rules for all custom font families and their variants. */
export function injectCustomFonts(): void {
  if (typeof document === "undefined") return;
  const existing = document.getElementById("vidscale-custom-fonts");
  if (existing) existing.remove();

  const fonts = getCustomFonts();
  const withVariants = fonts.filter((f) => f.variants?.length > 0);
  if (withVariants.length === 0) return;

  const style = document.createElement("style");
  style.id = "vidscale-custom-fonts";
  style.setAttribute("aria-hidden", "true");

  const rules: string[] = [];
  for (const font of withVariants) {
    const family = font.familyName.replace(/'/g, "\\'");
    for (const v of font.variants) {
      if (!v.url?.trim()) continue;
      const weight = v.weight ?? "400";
      const styleAttr = v.style ?? "normal";
      rules.push(
        `@font-face{font-family:'${family}';src:url(${JSON.stringify(v.url)});font-weight:${weight};font-style:${styleAttr};}`
      );
    }
  }
  style.textContent = rules.join("\n");
  document.head.appendChild(style);
}

/** Call on app init to apply saved font settings. */
export function applyFontSettings(): void {
  injectGoogleFonts();
  injectCustomFonts();
}
