const STORAGE_KEY = "vidscale-brand-kits";

export type BrandKit = {
  id: string;
  name: string;
  description?: string;
  primaryColor?: string;
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

export function saveBrandKit(input: { name: string; description?: string; primaryColor?: string }): BrandKit {
  const kits = loadKits();
  const kit: BrandKit = {
    id: crypto.randomUUID(),
    name: input.name || "Untitled Brand Kit",
    description: input.description ?? undefined,
    primaryColor: input.primaryColor ?? undefined,
    createdAt: new Date().toISOString(),
  };
  kits.push(kit);
  saveKits(kits);
  return kit;
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
