const STORAGE_KEY = "vidscale-brand-kits";

export type BrandKit = {
  id: string;
  name: string;
  description?: string;
  primaryColor?: string;
  /** Optional brand logo/icon image URL; if missing, card shows initial + primary color */
  logoUrl?: string;
  createdAt: string;
};

function loadKits(): BrandKit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BrandKit[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveKits(kits: BrandKit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kits));
}

export function getBrandKits(): BrandKit[] {
  let kits = loadKits();
  if (kits.length === 0) {
    kits = seedDemoBrandKits();
    saveKits(kits);
  }
  return kits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getBrandKitById(id: string): BrandKit | null {
  const kits = loadKits();
  return kits.find((k) => k.id === id) ?? null;
}

export function saveBrandKit(input: { name: string; description?: string; primaryColor?: string; logoUrl?: string }): BrandKit {
  const kits = loadKits();
  const kit: BrandKit = {
    id: crypto.randomUUID(),
    name: input.name || "Untitled Brand Kit",
    description: input.description ?? undefined,
    primaryColor: input.primaryColor ?? undefined,
    logoUrl: input.logoUrl ?? undefined,
    createdAt: new Date().toISOString(),
  };
  kits.push(kit);
  saveKits(kits);
  return kit;
}

export function updateBrandKit(
  id: string,
  input: { name: string; description?: string; primaryColor?: string; logoUrl?: string }
): BrandKit | null {
  const kits = loadKits();
  const index = kits.findIndex((k) => k.id === id);
  if (index === -1) return null;
  kits[index] = {
    ...kits[index],
    name: input.name?.trim() || "Untitled Brand Kit",
    description: input.description?.trim() || undefined,
    primaryColor: input.primaryColor ?? undefined,
    logoUrl: input.logoUrl ?? undefined,
  };
  saveKits(kits);
  return kits[index];
}

export function deleteBrandKit(id: string): boolean {
  const kits = loadKits();
  const filtered = kits.filter((k) => k.id !== id);
  if (filtered.length === kits.length) return false;
  saveKits(filtered);
  return true;
}

export function seedDemoBrandKits(): BrandKit[] {
  const demo: BrandKit[] = [
    {
      id: "demo-1",
      name: "VidScale Default",
      description: "Primary green theme for VidScale product videos.",
      primaryColor: "#00ff00",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-2",
      name: "Retro Synthwave",
      description: "Neon colors and 80s style for short-form content.",
      primaryColor: "#EC4899",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-3",
      name: "Minimal Light",
      description: "Clean, light palette for explainer and tutorial videos.",
      primaryColor: "#F59E0B",
      createdAt: new Date().toISOString(),
    },
  ];
  return demo;
}
