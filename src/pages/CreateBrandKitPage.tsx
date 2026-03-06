import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Image,
  Palette,
  Type,
  Megaphone,
  Film,
  FileText,
  Upload,
  Lightbulb,
  Briefcase,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { saveBrandKit } from "@/lib/brandKits";

const FONT_FAMILIES = ["Montserrat", "Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Playfair Display", "Source Sans 3"] as const;
const FONT_WEIGHTS = ["Light", "Regular", "Medium", "SemiBold", "Bold"] as const;
const PREVIEW_PHRASE = "The quick brown fox jumps over the lazy dog";

const STYLE_PRESETS = ["Retro", "Luxury", "Corporate", "Nature", "Bold", "Minimal", "Warm", "Cool", "Pastel", "Dark", "Vibrant"] as const;

const PALETTE_PRESETS: { name: string; colors: string[] }[] = [
  { name: "Vintage", colors: ["#B91C1C", "#EA580C", "#16A34A", "#EAB308", "#78350F"] },
  { name: "70s Funk", colors: ["#EA580C", "#7F1D1D", "#FDBA74", "#78350F"] },
  { name: "Synthwave", colors: ["#EC4899", "#8B5CF6", "#3B82F6", "#22D3EE", "#10B981"] },
  { name: "Sepia", colors: ["#78350F", "#A16207", "#1C1917"] },
];

const DEFAULT_COLORS = {
  primary: { hex: "#F59E0B", enabled: true, label: "Primary Color", description: "Main brand color for highlights and accents" },
  secondary: { hex: "#FBBF24", enabled: true, label: "Secondary Color", description: "Supporting color for gradients and variations" },
  accent: { hex: "#FFFFFF", enabled: true, label: "Accent Color", description: "Eye-catching color for CTAs and important elements" },
  text: { hex: "#FFFBEB", enabled: true, label: "Text Color", description: "Default text color for captions and overlays" },
  background: { hex: "#1C1917", enabled: true, label: "Background Color", description: "Default background for video elements" },
};

type ColorKey = keyof typeof DEFAULT_COLORS;

const CTA_PRESET_TEXTS = [
  "Follow for more!",
  "Like & Subscribe!",
  "Link in bio",
  "Comment below!",
  "Share with a friend!",
  "Turn on notifications!",
] as const;

const CTA_POSITIONS = ["Bottom Center", "Bottom Left", "Bottom Right", "Top Center", "Top Left", "Top Right", "Center"] as const;

const CAPTION_THEMES = [
  "Highlight", "HORMOZI 1", "ali", "NOAH", "DEVIN", "Elegant", "Reveal", "Shimmy",
  "cRay", "Cursor", "MR BEAST 1", "DAVID", "HORMOZI 2", "MR BEAST 2", "Iman", "DHRUV", "Flash", "Cyberpunk", "Custom",
] as const;

const CAPTION_FONT_SIZES = [60, 70, 80, 90, 100, 110, 120] as const;
const CAPTION_TEXT_CASES = ["Default", "Uppercase", "Lowercase", "Title case"] as const;

const TABS = [
  { id: "logos", label: "Logos", icon: Image },
  { id: "colors", label: "Colors", icon: Palette },
  { id: "fonts", label: "Fonts", icon: Type },
  { id: "cta", label: "CTA", icon: Megaphone },
  { id: "intro-outro", label: "Intro/Outro", icon: Film },
  { id: "caption-style", label: "Caption Style", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CreateBrandKitPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("logos");
  const primaryLogoRef = useRef<HTMLInputElement>(null);
  const watermarkLogoRef = useRef<HTMLInputElement>(null);

  const [brandColors, setBrandColors] = useState<Record<ColorKey, { hex: string; enabled: boolean; label: string; description: string }>>(DEFAULT_COLORS);
  const [stylePreset, setStylePreset] = useState<string>("Retro");

  const [headingFont, setHeadingFont] = useState<string>("Montserrat");
  const [headingWeight, setHeadingWeight] = useState<string>("Bold");
  const [captionFont, setCaptionFont] = useState<string>("Montserrat");
  const [captionWeight, setCaptionWeight] = useState<string>("Bold");

  const [ctaText, setCtaText] = useState<string>("Follow for more!");
  const [ctaPosition, setCtaPosition] = useState<string>("Bottom Center");
  const [ctaXOffset, setCtaXOffset] = useState(0);
  const [ctaYOffset, setCtaYOffset] = useState(0);
  const [ctaFontSize, setCtaFontSize] = useState(80);
  const [ctaBgColor, setCtaBgColor] = useState("#00ff00");
  const [ctaTextColor, setCtaTextColor] = useState("#FFFFFF");
  const [ctaMediaFile, setCtaMediaFile] = useState<File | null>(null);
  const [ctaBlendMode, setCtaBlendMode] = useState<"screen" | "multiply">("screen");
  const ctaMediaRef = useRef<HTMLInputElement>(null);

  const [introFile, setIntroFile] = useState<File | null>(null);
  const [outroFile, setOutroFile] = useState<File | null>(null);
  const introClipRef = useRef<HTMLInputElement>(null);
  const outroClipRef = useRef<HTMLInputElement>(null);

  const [captionTheme, setCaptionTheme] = useState<string>("Highlight");
  const [captionFontSize, setCaptionFontSize] = useState(80);
  const [captionTextColor, setCaptionTextColor] = useState("#FFFFFF");
  const [captionHighlightColor, setCaptionHighlightColor] = useState("#FFFF00");
  const [captionTextCase, setCaptionTextCase] = useState<string>("Default");

  const setColorHex = (key: ColorKey, hex: string) => {
    setBrandColors((prev) => ({ ...prev, [key]: { ...prev[key], hex } }));
  };
  const setColorEnabled = (key: ColorKey, enabled: boolean) => {
    setBrandColors((prev) => ({ ...prev, [key]: { ...prev[key], enabled } }));
  };
  const applyPalette = (colors: string[]) => {
    const keys: ColorKey[] = ["primary", "secondary", "accent", "text", "background"];
    setBrandColors((prev) => {
      const next = { ...prev };
      keys.forEach((key, i) => {
        if (colors[i]) next[key] = { ...next[key], hex: colors[i] };
      });
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveBrandKit({
      name: name.trim() || "Untitled Brand Kit",
      description: description.trim() || undefined,
      primaryColor: brandColors.primary.hex,
    });
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0D1117]">
      {/* Toolbar */}
      <div className="shrink-0 h-11 px-4 flex items-center gap-3 border-b border-border bg-[#161B22]">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ChevronLeft size={18} />
          Back
        </Link>
        <span className="text-muted-foreground/50">|</span>
        <h1 className="text-sm font-semibold text-foreground">Create Brand Kit</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left: Section list – PC app style */}
        <aside className="w-52 shrink-0 flex flex-col border-r border-border bg-[#161B22]">
          <div className="px-3 py-3 border-b border-border">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Sections</span>
          </div>
          <nav className="flex-1 min-h-0 overflow-y-auto py-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  activeTab === id
                    ? "bg-primary/15 text-primary border-l-2 border-primary -ml-px"
                    : "text-foreground hover:bg-white/5 border-l-2 border-transparent"
                )}
              >
                <Icon size={18} className="shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main: Basic Info + active section content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-2xl p-6 space-y-8">
              {/* Basic Info – always visible at top */}
              <section className="rounded-lg border border-border bg-[#161B22]/80 p-5">
                <h2 className="text-sm font-semibold text-foreground mb-1">Basic Info</h2>
                <p className="text-xs text-muted-foreground mb-4">Name and describe this brand kit.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand-kit-name" className="text-sm text-foreground">Brand Kit Name</Label>
                    <Input
                      id="brand-kit-name"
                      placeholder="e.g., My Main Brand"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9 bg-background/50 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand-kit-desc" className="text-sm text-foreground">Description (optional)</Label>
                    <Input
                      id="brand-kit-desc"
                      placeholder="e.g., For product videos"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="h-9 bg-background/50 border-border"
                    />
                  </div>
                </div>
              </section>

              {/* Active section content */}
              <section className="rounded-lg border border-border bg-[#161B22]/80 p-5">
                {activeTab === "logos" && (
                  <>
                    <h2 className="text-sm font-semibold text-foreground mb-1">Logos</h2>
                    <p className="text-xs text-muted-foreground mb-4">Upload your main logo and watermark for videos.</p>
                    <div className="space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Your main brand logo. Recommended: PNG with transparent background.
                      </p>
                      <UploadZone
                        label="Click to upload logo"
                        onClick={() => primaryLogoRef.current?.click()}
                      />
                      <input
                        ref={primaryLogoRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        aria-label="Upload primary logo"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Displayed on videos. Configure position, opacity, and size.
                      </p>
                      <UploadZone
                        label="Click to upload watermark"
                        onClick={() => watermarkLogoRef.current?.click()}
                      />
                      <input
                        ref={watermarkLogoRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        aria-label="Upload watermark logo"
                      />
                    </div>
                  </div>
                    </div>
                  </>
                )}
                {activeTab === "colors" && (
                  <div className="space-y-6">
                    <h2 className="text-sm font-semibold text-foreground mb-1">Brand Colors</h2>
                    <p className="text-xs text-muted-foreground mb-4">Define your color palette for consistent video styling.</p>

                  {/* Preview swatches */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Preview</p>
                    <div className="flex flex-wrap gap-2">
                      {(["primary", "secondary", "accent", "text", "background"] as ColorKey[]).map((key) => (
                        <div
                          key={key}
                          className="w-12 h-12 rounded-lg border border-border shadow-inner shrink-0"
                          style={{ backgroundColor: brandColors[key].hex }}
                          title={brandColors[key].hex}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quick presets - style categories */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Quick Presets</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {STYLE_PRESETS.map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setStylePreset(style)}
                          className={cn(
                            "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                            stylePreset === style
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border bg-input/20 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                          )}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {PALETTE_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => applyPalette(preset.colors)}
                          className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-input/10 px-3 py-2 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex gap-1">
                            {preset.colors.map((hex) => (
                              <div
                                key={hex}
                                className="w-6 h-6 rounded-full border border-white/20 shrink-0"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Individual color definitions */}
                  <div className="space-y-4">
                    {(["primary", "secondary", "accent", "text", "background"] as ColorKey[]).map((key) => {
                      const c = brandColors[key];
                      const showToggle = key !== "background";
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-4 rounded-lg border border-border bg-input/10 px-4 py-3"
                        >
                          <div
                            className="w-10 h-10 rounded-lg border border-border shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Input
                                value={c.hex}
                                onChange={(e) => setColorHex(key, e.target.value)}
                                className="font-mono text-sm w-24 h-8 bg-background/50"
                              />
                              <span className="text-sm font-medium text-foreground">{c.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{c.description}</p>
                          </div>
                          {showToggle && (
                            <Switch
                              checked={c.enabled}
                              onCheckedChange={(checked) => setColorEnabled(key, checked)}
                              aria-label={`Toggle ${c.label}`}
                              className="shrink-0"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {activeTab === "fonts" && (
                  <div className="space-y-6">
                    <h2 className="text-sm font-semibold text-foreground mb-1">Fonts</h2>
                    <p className="text-xs text-muted-foreground mb-4">Set your brand fonts for consistent text styling.</p>

                  {/* Heading Font */}
                  <div className="space-y-4 rounded-lg border border-border bg-input/10 p-5">
                    <h4 className="text-sm font-medium text-foreground">Heading Font</h4>
                    <p className="text-xs text-muted-foreground">
                      Used for titles, hooks, and prominent text overlays.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Font Family</Label>
                        <Select value={headingFont} onValueChange={setHeadingFont}>
                          <SelectTrigger className="w-[180px] bg-background/50 border-border">
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_FAMILIES.map((font) => (
                              <SelectItem key={font} value={font}>
                                {font}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Font Weight</Label>
                        <Select value={headingWeight} onValueChange={setHeadingWeight}>
                          <SelectTrigger className="w-[120px] bg-background/50 border-border">
                            <SelectValue placeholder="Weight" />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_WEIGHTS.map((w) => (
                              <SelectItem key={w} value={w}>
                                {w}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p
                      className="text-xl font-bold text-foreground pt-2"
                      style={{
                        fontFamily: headingFont,
                        fontWeight: headingWeight === "Light" ? 300 : headingWeight === "Regular" ? 400 : headingWeight === "Medium" ? 500 : headingWeight === "SemiBold" ? 600 : 700,
                      }}
                    >
                      {PREVIEW_PHRASE}
                    </p>
                  </div>

                  {/* Caption Font */}
                  <div className="space-y-4 rounded-lg border border-border bg-input/10 p-5">
                    <h4 className="text-sm font-medium text-foreground">Caption Font</h4>
                    <p className="text-xs text-muted-foreground">
                      Used for video captions and subtitles.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Font Family</Label>
                        <Select value={captionFont} onValueChange={setCaptionFont}>
                          <SelectTrigger className="w-[180px] bg-background/50 border-border">
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_FAMILIES.map((font) => (
                              <SelectItem key={font} value={font}>
                                {font}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Font Weight</Label>
                        <Select value={captionWeight} onValueChange={setCaptionWeight}>
                          <SelectTrigger className="w-[120px] bg-background/50 border-border">
                            <SelectValue placeholder="Weight" />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_WEIGHTS.map((w) => (
                              <SelectItem key={w} value={w}>
                                {w}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p
                      className="text-lg text-foreground pt-2"
                      style={{
                        fontFamily: captionFont,
                        fontWeight: captionWeight === "Light" ? 300 : captionWeight === "Regular" ? 400 : captionWeight === "Medium" ? 500 : captionWeight === "SemiBold" ? 600 : 700,
                      }}
                    >
                      {PREVIEW_PHRASE}
                    </p>
                  </div>
                  </div>
                )}
                {activeTab === "cta" && (
                  <div className="space-y-6">
                    <h2 className="text-sm font-semibold text-foreground mb-1">Call to Action (CTA)</h2>
                    <p className="text-xs text-muted-foreground mb-4">Set your default CTA text and styling for videos.</p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Preview */}
                    <div className="lg:col-span-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Preview</p>
                      <div className="aspect-video rounded-lg border border-border bg-[#161B22] flex items-end justify-center p-4 relative">
                        <div
                          className="px-4 py-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: ctaBgColor,
                            color: ctaTextColor,
                            fontSize: Math.min(ctaFontSize / 4, 24),
                            transform: `translate(${ctaXOffset}%, ${ctaYOffset}%)`,
                          }}
                        >
                          {ctaText}
                        </div>
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="space-y-2">
                        <Label className="text-foreground">CTA Text</Label>
                        <Input
                          value={ctaText}
                          onChange={(e) => setCtaText(e.target.value)}
                          placeholder="e.g., Follow for more!"
                          className="bg-input/50 border-border"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {CTA_PRESET_TEXTS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setCtaText(preset)}
                              className={cn(
                                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                                ctaText === preset
                                  ? "border-primary bg-primary/15 text-primary"
                                  : "border-border bg-input/20 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                              )}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 rounded-lg border border-border bg-input/10 p-4">
                        <h4 className="text-sm font-medium text-foreground">CTA Styling</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs">Position</Label>
                            <Select value={ctaPosition} onValueChange={setCtaPosition}>
                              <SelectTrigger className="w-full bg-background/50 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CTA_POSITIONS.map((pos) => (
                                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs">Font Size</Label>
                            <Input
                              type="number"
                              min={12}
                              max={200}
                              value={ctaFontSize}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                if (!Number.isNaN(v)) setCtaFontSize(Math.min(200, Math.max(12, v)));
                              }}
                              className="bg-background/50 border-border"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-muted-foreground text-xs">X Offset</Label>
                            <span className="text-xs text-muted-foreground">{ctaXOffset}%</span>
                          </div>
                          <input
                            type="range"
                            min={-100}
                            max={100}
                            value={ctaXOffset}
                            onChange={(e) => setCtaXOffset(Number(e.target.value))}
                            className="w-full h-2 rounded-full appearance-none bg-input accent-primary cursor-pointer"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-muted-foreground text-xs">Y Offset</Label>
                            <span className="text-xs text-muted-foreground">{ctaYOffset}%</span>
                          </div>
                          <input
                            type="range"
                            min={-100}
                            max={100}
                            value={ctaYOffset}
                            onChange={(e) => setCtaYOffset(Number(e.target.value))}
                            className="w-full h-2 rounded-full appearance-none bg-input accent-primary cursor-pointer"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs">Background Color</Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={ctaBgColor}
                                onChange={(e) => setCtaBgColor(e.target.value)}
                                className="w-10 h-9 rounded border border-border cursor-pointer bg-transparent"
                              />
                              <Input
                                value={ctaBgColor}
                                onChange={(e) => setCtaBgColor(e.target.value)}
                                className="font-mono text-sm flex-1 bg-background/50 border-border"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs">Text Color</Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={ctaTextColor}
                                onChange={(e) => setCtaTextColor(e.target.value)}
                                className="w-10 h-9 rounded border border-border cursor-pointer bg-transparent"
                              />
                              <Input
                                value={ctaTextColor}
                                onChange={(e) => setCtaTextColor(e.target.value)}
                                className="font-mono text-sm flex-1 bg-background/50 border-border"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Upload Videos and Images */}
                      <div className="space-y-4 rounded-lg border border-border bg-input/10 p-4">
                        <h4 className="text-sm font-medium text-foreground">Upload Videos and Images</h4>
                        <p className="text-xs text-muted-foreground">
                          Optional. Upload a video or image to use as your CTA asset.
                        </p>
                        <input
                          ref={ctaMediaRef}
                          type="file"
                          accept="video/*,image/*"
                          className="sr-only"
                          onChange={(e) => setCtaMediaFile(e.target.files?.[0] ?? null)}
                          aria-label="Upload CTA video or image"
                        />
                        <button
                          type="button"
                          onClick={() => ctaMediaRef.current?.click()}
                          className={cn(
                            "w-full min-h-[100px] rounded-lg border-2 border-dashed border-border bg-input/20",
                            "flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
                          )}
                        >
                          <Upload size={24} />
                          <span className="text-sm font-medium">
                            {ctaMediaFile ? ctaMediaFile.name : "Click to upload video or image"}
                          </span>
                        </button>

                        {/* Blend mode: Screen or Multiply */}
                        <div className="space-y-2 pt-2 border-t border-border">
                          <Label className="text-muted-foreground text-xs">Blend mode for video/image</Label>
                          <p className="text-xs text-muted-foreground">
                            How the uploaded video or image is composited over the video.
                          </p>
                          <div className="flex gap-4">
                            <label className={cn(
                              "flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors flex-1",
                              ctaBlendMode === "screen" ? "border-primary bg-primary/15 text-primary" : "border-border bg-input/20 text-foreground hover:bg-white/5"
                            )}>
                              <input
                                type="radio"
                                name="cta-blend"
                                value="screen"
                                checked={ctaBlendMode === "screen"}
                                onChange={() => setCtaBlendMode("screen")}
                                className="sr-only"
                              />
                              <span className="text-sm font-medium">Screen</span>
                            </label>
                            <label className={cn(
                              "flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors flex-1",
                              ctaBlendMode === "multiply" ? "border-primary bg-primary/15 text-primary" : "border-border bg-input/20 text-foreground hover:bg-white/5"
                            )}>
                              <input
                                type="radio"
                                name="cta-blend"
                                value="multiply"
                                checked={ctaBlendMode === "multiply"}
                                onChange={() => setCtaBlendMode("multiply")}
                                className="sr-only"
                              />
                              <span className="text-sm font-medium">Multiply</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                )}
                {activeTab === "intro-outro" && (
                  <div className="space-y-6">
                    <h2 className="text-sm font-semibold text-foreground mb-1">Intro & Outro Clips</h2>
                    <p className="text-xs text-muted-foreground mb-4">Add video clips that play at the start and end of your videos.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Intro Clip */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground">Intro Clip</h4>
                      <p className="text-xs text-muted-foreground">
                        Video clip to play at the beginning of your videos.
                      </p>
                      <input
                        ref={introClipRef}
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
                        className="sr-only"
                        onChange={(e) => setIntroFile(e.target.files?.[0] ?? null)}
                        aria-label="Upload intro clip"
                      />
                      <button
                        type="button"
                        onClick={() => introClipRef.current?.click()}
                        className={cn(
                          "w-full min-h-[140px] rounded-lg border-2 border-dashed border-border bg-input/20",
                          "flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
                        )}
                      >
                        <Upload size={32} />
                        <span className="text-sm font-medium">
                          {introFile ? introFile.name : "Click to upload intro"}
                        </span>
                      </button>
                      <p className="text-[11px] text-muted-foreground">MP4, MOV, WebM (max 200MB)</p>
                    </div>

                    {/* Outro Clip */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground">Outro Clip</h4>
                      <p className="text-xs text-muted-foreground">
                        Video clip to play at the end of your videos.
                      </p>
                      <input
                        ref={outroClipRef}
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
                        className="sr-only"
                        onChange={(e) => setOutroFile(e.target.files?.[0] ?? null)}
                        aria-label="Upload outro clip"
                      />
                      <button
                        type="button"
                        onClick={() => outroClipRef.current?.click()}
                        className={cn(
                          "w-full min-h-[140px] rounded-lg border-2 border-dashed border-border bg-input/20",
                          "flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
                        )}
                      >
                        <Upload size={32} />
                        <span className="text-sm font-medium">
                          {outroFile ? outroFile.name : "Click to upload outro"}
                        </span>
                      </button>
                      <p className="text-[11px] text-muted-foreground">MP4, MOV, WebM (max 200MB)</p>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="rounded-lg border border-border bg-input/10 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb size={18} className="text-primary shrink-0" />
                      <h4 className="text-sm font-medium text-foreground">Tips for Intro/Outro Clips</h4>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                      <li>Keep clips short (2-5 seconds) for better viewer retention</li>
                      <li>Use consistent branding elements across all clips</li>
                      <li>Include a subtle animation or motion for visual interest</li>
                      <li>Outro clips are great for CTAs and social links</li>
                    </ul>
                  </div>
                  </div>
                )}
                {activeTab === "caption-style" && (
                  <div className="space-y-6">
                    <h2 className="text-sm font-semibold text-foreground mb-1">Caption Style</h2>
                    <p className="text-xs text-muted-foreground mb-4">Configure your default caption appearance for videos.</p>

                  {/* Caption Theme */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Caption Theme</h4>
                    <div className="flex flex-wrap gap-2">
                      {CAPTION_THEMES.map((theme) => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => setCaptionTheme(theme)}
                          className={cn(
                            "rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                            captionTheme === theme
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border bg-input/20 text-foreground hover:bg-white/5"
                          )}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Font Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {CAPTION_FONT_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setCaptionFontSize(size)}
                          className={cn(
                            "rounded-lg border px-4 py-2 text-sm font-medium tabular-nums transition-colors",
                            captionFontSize === size
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-input/20 text-foreground hover:bg-white/5"
                          )}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Color, Highlight Color, Text Case */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">Text Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={captionTextColor}
                          onChange={(e) => setCaptionTextColor(e.target.value)}
                          className="w-10 h-9 rounded border border-border cursor-pointer bg-transparent"
                        />
                        <Input
                          value={captionTextColor}
                          onChange={(e) => setCaptionTextColor(e.target.value)}
                          className="font-mono text-sm flex-1 bg-background/50 border-border"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">Highlight Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={captionHighlightColor}
                          onChange={(e) => setCaptionHighlightColor(e.target.value)}
                          className="w-10 h-9 rounded border border-border cursor-pointer bg-transparent"
                        />
                        <Input
                          value={captionHighlightColor}
                          onChange={(e) => setCaptionHighlightColor(e.target.value)}
                          className="font-mono text-sm flex-1 bg-background/50 border-border"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">Text Case</Label>
                      <Select value={captionTextCase} onValueChange={setCaptionTextCase}>
                        <SelectTrigger className="w-full bg-background/50 border-border">
                          <SelectValue placeholder="Case" />
                        </SelectTrigger>
                        <SelectContent>
                          {CAPTION_TEXT_CASES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              {activeTab !== "logos" && activeTab !== "colors" && activeTab !== "fonts" && activeTab !== "cta" && activeTab !== "intro-outro" && activeTab !== "caption-style" && (
                  <p className="text-sm text-muted-foreground py-4">Select a section from the left.</p>
                )}
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 h-11 flex items-center justify-end gap-3 px-4 border-t border-border bg-[#161B22]">
          <Button type="button" variant="outline" asChild className="h-9 rounded-md px-4 text-sm">
            <Link to="/">Cancel</Link>
          </Button>
          <Button type="submit" className="gap-2 h-9 rounded-md px-5 text-sm" size="sm">
            <Briefcase size={16} />
            Create Brand Kit
          </Button>
        </div>
      </form>
    </div>
  );
}

function UploadZone({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full min-h-[120px] rounded-lg border-2 border-dashed border-border bg-input/20",
        "flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
      )}
    >
      <Upload size={28} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
