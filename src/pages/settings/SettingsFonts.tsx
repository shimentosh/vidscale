import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getGoogleFontsApiKey,
  setGoogleFontsApiKey,
  getCachedGoogleFonts,
  setCachedGoogleFonts,
  getCustomFonts,
  setCustomFonts,
  type CustomFont,
  type CustomFontVariant,
} from "@/lib/fontSettings";
import { Plus, X, Upload, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANT_PRESETS: { label: string; weight: string; style: string }[] = [
  { label: "Regular", weight: "400", style: "normal" },
  { label: "Bold", weight: "700", style: "normal" },
  { label: "Italic", weight: "400", style: "italic" },
  { label: "Bold Italic", weight: "700", style: "italic" },
  { label: "Light", weight: "300", style: "normal" },
  { label: "Medium", weight: "500", style: "normal" },
  { label: "SemiBold", weight: "600", style: "normal" },
];

const POPULAR_GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Poppins",
  "Montserrat",
  "Source Sans 3",
  "Playfair Display",
  "Oswald",
  "Raleway",
  "Merriweather",
  "Nunito",
];

export function SettingsFonts() {
  const [apiKey, setApiKeyState] = useState("");
  const [cached, setCachedState] = useState<string[]>([]);
  const [customFonts, setCustomFontsState] = useState<CustomFont[]>([]);
  const [expandedFontId, setExpandedFontId] = useState<string | null>(null);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [fontToAdd, setFontToAdd] = useState("");

  useEffect(() => {
    setApiKeyState(getGoogleFontsApiKey());
    setCachedState(getCachedGoogleFonts());
    setCustomFontsState(getCustomFonts());
  }, []);

  const handleSaveApiKey = () => {
    setGoogleFontsApiKey(apiKey);
  };

  const handleAddCached = () => {
    const name = fontToAdd.trim();
    if (!name || cached.includes(name)) return;
    const next = [...cached, name];
    setCachedState(next);
    setCachedGoogleFonts(next);
    setFontToAdd("");
  };

  const handleRemoveCached = (family: string) => {
    const next = cached.filter((f) => f !== family);
    setCachedState(next);
    setCachedGoogleFonts(next);
  };

  const handleAddCustomFont = () => {
    const familyName = newFamilyName.trim();
    if (!familyName) return;
    const id = crypto.randomUUID();
    const next: CustomFont[] = [
      ...customFonts,
      { id, familyName, variants: [] },
    ];
    setCustomFontsState(next);
    setCustomFonts(next);
    setNewFamilyName("");
    setExpandedFontId(id);
  };

  const handleRemoveCustomFont = (id: string) => {
    const next = customFonts.filter((f) => f.id !== id);
    setCustomFontsState(next);
    setCustomFonts(next);
  };

  const updateCustomFonts = (next: CustomFont[]) => {
    setCustomFontsState(next);
    setCustomFonts(next);
  };

  const handleAddVariant = (fontId: string, preset: (typeof VARIANT_PRESETS)[0]) => {
    const font = customFonts.find((f) => f.id === fontId);
    if (!font || font.variants.some((v) => v.label === preset.label)) return;
    const variant: CustomFontVariant = {
      id: crypto.randomUUID(),
      label: preset.label,
      weight: preset.weight,
      style: preset.style,
      url: "",
    };
    const next = customFonts.map((f) =>
      f.id === fontId ? { ...f, variants: [...f.variants, variant] } : f
    );
    updateCustomFonts(next);
  };

  const handleVariantUrlChange = (fontId: string, variantId: string, url: string) => {
    const next = customFonts.map((f) => {
      if (f.id !== fontId) return f;
      return {
        ...f,
        variants: f.variants.map((v) => (v.id === variantId ? { ...v, url } : v)),
      };
    });
    updateCustomFonts(next);
  };

  const handleVariantFileUpload = (fontId: string, variantId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      handleVariantUrlChange(fontId, variantId, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveVariant = (fontId: string, variantId: string) => {
    const next = customFonts.map((f) => {
      if (f.id !== fontId) return f;
      const variants = f.variants.filter((v) => v.id !== variantId);
      return { ...f, variants };
    });
    updateCustomFonts(next);
  };

  return (
    <div className="py-10 px-8 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Fonts
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Google Fonts API and custom fonts. Cached fonts load once and are used across the app.
        </p>
      </div>

      <div className="space-y-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Google Fonts API</CardTitle>
            <CardDescription>
              Optional: add your API key to fetch the full font list. Leave empty to use popular fonts only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fonts-api-key" className="text-foreground">API Key</Label>
              <Input
                id="fonts-api-key"
                type="password"
                placeholder="Your Google Fonts API key"
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                className="bg-background/50 border-border"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Get a key from{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Cloud Console
                </a>
                {" "}(enable Google Fonts API).
              </p>
            </div>
            <Button type="button" size="sm" onClick={handleSaveApiKey}>
              Save API Key
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Cached Google Fonts</CardTitle>
            <CardDescription>
              Fonts listed here are loaded from Google and cached. Add by name (e.g. from the list below).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {POPULAR_GOOGLE_FONTS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    if (!cached.includes(f)) {
                      const next = [...cached, f];
                      setCachedState(next);
                      setCachedGoogleFonts(next);
                    }
                  }}
                  disabled={cached.includes(f)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-muted/30 text-foreground hover:bg-muted/60 disabled:opacity-50 disabled:cursor-default"
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Or type a font name and add"
                value={fontToAdd}
                onChange={(e) => setFontToAdd(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCached())}
                className="bg-background/50 border-border flex-1"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddCached}>
                <Plus size={16} />
              </Button>
            </div>
            {cached.length > 0 && (
              <ul className="space-y-1.5">
                {cached.map((family) => (
                  <li
                    key={family}
                    className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-muted/30 border border-border/60"
                    style={{ fontFamily: family }}
                  >
                    <span className="text-sm text-foreground">{family}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCached(family)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Remove ${family}`}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Custom Fonts</CardTitle>
            <CardDescription>
              One font family can have multiple variants (Regular, Bold, Italic, etc.). Add a family, then add variants and upload files or paste URLs for each.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex w-full gap-2">
              <Input
                placeholder="Font family name"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomFont())}
                className="flex-1 min-w-0 bg-background/50 border-border"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddCustomFont} className="shrink-0">
                <Plus size={16} className="mr-1" />
                Add font family
              </Button>
            </div>

            {customFonts.length > 0 && (
              <div className="space-y-2">
                {customFonts.map((font) => {
                  const isExpanded = expandedFontId === font.id;
                  const variantCount = font.variants.length;
                  return (
                    <div
                      key={font.id}
                      className="rounded-xl border border-border bg-muted/20 overflow-hidden"
                    >
                      <div
                        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => setExpandedFontId((id) => (id === font.id ? null : font.id))}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setExpandedFontId((id) => (id === font.id ? null : font.id));
                          }
                        }}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? (
                          <ChevronDown size={18} className="shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className="font-semibold text-foreground flex-1 truncate"
                          style={{ fontFamily: font.familyName }}
                        >
                          {font.familyName}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {variantCount} variant{variantCount !== 1 ? "s" : ""}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCustomFont(font.id);
                            if (expandedFontId === font.id) setExpandedFontId(null);
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          aria-label={`Remove ${font.familyName}`}
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-border p-4 space-y-3 bg-background/30">
                          <div className="flex flex-wrap items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Add variant:</Label>
                            {VARIANT_PRESETS.filter(
                              (p) => !font.variants.some((v) => v.label === p.label)
                            ).map((preset) => (
                              <Button
                                key={preset.label}
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => handleAddVariant(font.id, preset)}
                              >
                                {preset.label}
                              </Button>
                            ))}
                            {font.variants.length === VARIANT_PRESETS.length && (
                              <span className="text-xs text-muted-foreground">All variants added</span>
                            )}
                          </div>

                          {font.variants.length > 0 && (
                            <ul className="space-y-2">
                              {font.variants.map((v) => (
                                <li
                                  key={v.id}
                                  className="flex flex-wrap items-center gap-2 py-2 px-3 rounded-lg border border-border/60 bg-background/50"
                                >
                                  <span className="text-xs font-medium text-foreground w-24 shrink-0">
                                    {v.label}
                                  </span>
                                  <Input
                                    placeholder="URL or upload file below"
                                    value={v.url.startsWith("data:") ? "(uploaded file)" : v.url}
                                    onChange={(e) => handleVariantUrlChange(font.id, v.id, e.target.value)}
                                    className="flex-1 min-w-0 max-w-[280px] bg-background border-border text-sm"
                                  />
                                  <label className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="file"
                                      accept=".woff2,.woff,.ttf,.otf"
                                      className="sr-only"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleVariantFileUpload(font.id, v.id, file);
                                        e.target.value = "";
                                      }}
                                    />
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-border bg-muted/50 text-foreground hover:bg-muted">
                                      <Upload size={12} />
                                      Upload
                                    </span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleRemoveVariant(font.id, v.id); }}
                                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    aria-label={`Remove ${v.label}`}
                                  >
                                    <X size={14} />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
