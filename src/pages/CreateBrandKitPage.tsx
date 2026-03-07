import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { getBrandKitById, saveBrandKit, updateBrandKit } from "@/lib/brandKits";

const FONT_FAMILIES = ["Montserrat", "Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Playfair Display", "Source Sans 3"] as const;
const FONT_WEIGHTS = ["Light", "Regular", "Medium", "SemiBold", "Bold"] as const;
const PREVIEW_PHRASE = "The quick brown fox jumps over the lazy dog";

/** Single color preset: one option per preset */
const BRAND_COLOR_PRESETS = [
  { name: "Amber", hex: "#F59E0B" },
  { name: "Vintage Red", hex: "#B91C1C" },
  { name: "Synthwave Pink", hex: "#EC4899" },
  { name: "Green", hex: "#10B981" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Dark", hex: "#1C1917" },
] as const;

const CTA_PRESET_TEXTS = [
  "Follow for more!",
  "Like & Subscribe!",
  "Link in bio",
  "Comment below!",
  "Share with a friend!",
  "Turn on notifications!",
] as const;

const CTA_POSITIONS = ["Top Left", "Top Center", "Top Right", "Left Center", "Center", "Right Center", "Bottom Left", "Bottom Center", "Bottom Right"] as const;
const WATERMARK_POSITIONS = ["Top Left", "Top Center", "Top Right", "Left Center", "Center", "Right Center", "Bottom Left", "Bottom Center", "Bottom Right"] as const;

/** Style for watermark in preview by position + size */
function getWatermarkPreviewStyle(position: string, sizePercent: number): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    width: `${sizePercent}%`,
    height: `${sizePercent}%`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const pad = "0.75rem";
  switch (position) {
    case "Top Left":
      return { ...base, top: pad, left: pad };
    case "Top Center":
      return { ...base, top: pad, left: "50%", transform: "translateX(-50%)" };
    case "Top Right":
      return { ...base, top: pad, right: pad };
    case "Left Center":
      return { ...base, left: pad, top: "50%", transform: "translateY(-50%)" };
    case "Center":
      return { ...base, top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    case "Right Center":
      return { ...base, right: pad, top: "50%", transform: "translateY(-50%)" };
    case "Bottom Left":
      return { ...base, bottom: pad, left: pad };
    case "Bottom Center":
      return { ...base, bottom: pad, left: "50%", transform: "translateX(-50%)" };
    case "Bottom Right":
      return { ...base, bottom: pad, right: pad };
    default:
      return { ...base, bottom: pad, right: pad };
  }
}

/** Style for positioning/sizing the CTA asset in the preview (position + size% + x/y offset) */
function getCtaAssetPreviewStyle(
  position: string,
  sizePercent: number,
  xOffset: number,
  yOffset: number
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    width: `${sizePercent}%`,
    height: `${sizePercent}%`,
    transform: `translate(${xOffset}%, ${yOffset}%)`,
  };
  const pad = "1rem";
  switch (position) {
    case "Bottom Center":
      return { ...base, bottom: pad, left: "50%", transform: `translate(calc(-50% + ${xOffset}%), ${yOffset}%)` };
    case "Bottom Left":
      return { ...base, bottom: pad, left: pad, transform: `translate(${xOffset}%, ${yOffset}%)` };
    case "Bottom Right":
      return { ...base, bottom: pad, right: pad, transform: `translate(${xOffset}%, ${yOffset}%)` };
    case "Top Center":
      return { ...base, top: pad, left: "50%", transform: `translate(calc(-50% + ${xOffset}%), ${yOffset}%)` };
    case "Top Left":
      return { ...base, top: pad, left: pad, transform: `translate(${xOffset}%, ${yOffset}%)` };
    case "Top Right":
      return { ...base, top: pad, right: pad, transform: `translate(${xOffset}%, ${yOffset}%)` };
    case "Left Center":
      return { ...base, left: pad, top: "50%", transform: `translate(${xOffset}%, calc(-50% + ${yOffset}%))` };
    case "Center":
      return { ...base, top: "50%", left: "50%", transform: `translate(calc(-50% + ${xOffset}%), calc(-50% + ${yOffset}%))` };
    case "Right Center":
      return { ...base, right: pad, top: "50%", transform: `translate(${xOffset}%, calc(-50% + ${yOffset}%))` };
    default:
      return { ...base, bottom: pad, left: "50%", transform: `translate(calc(-50% + ${xOffset}%), ${yOffset}%)` };
  }
}

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
  const { id: kitId } = useParams<{ id: string }>();
  const isEdit = Boolean(kitId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("logos");

  useEffect(() => {
    if (!kitId) return;
    const kit = getBrandKitById(kitId);
    if (kit) {
      setName(kit.name);
      setDescription(kit.description ?? "");
      if (kit.primaryColor) setBrandColor(kit.primaryColor);
    }
  }, [kitId]);
  const primaryLogoRef = useRef<HTMLInputElement>(null);
  const watermarkLogoRef = useRef<HTMLInputElement>(null);
  const [watermarkLogoFile, setWatermarkLogoFile] = useState<File | null>(null);
  const [watermarkPosition, setWatermarkPosition] = useState("Bottom Right");
  const [watermarkOpacity, setWatermarkOpacity] = useState(80);
  const [watermarkSize, setWatermarkSize] = useState(15); // % of frame
  const [logoPreviewAspect, setLogoPreviewAspect] = useState<"9/16" | "16/9">("16/9");

  // Object URL for watermark preview
  const [watermarkPreviewUrl, setWatermarkPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!watermarkLogoFile) {
      setWatermarkPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(watermarkLogoFile);
    setWatermarkPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [watermarkLogoFile]);

  const [brandColor, setBrandColor] = useState("#F59E0B");

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
  const [ctaType, setCtaType] = useState<"upload" | "custom">("custom"); // "upload" = video/images, "custom" = text CTA
  const [ctaPreviewAspect, setCtaPreviewAspect] = useState<"9/16" | "16/9">("16/9");
  const [ctaAssetSize, setCtaAssetSize] = useState(100); // size/scale % for uploaded CTA asset (10–200)
  const ctaMediaRef = useRef<HTMLInputElement>(null);

  // Object URL for uploaded CTA media so preview can show image/video
  const [ctaMediaPreviewUrl, setCtaMediaPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!ctaMediaFile) {
      setCtaMediaPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(ctaMediaFile);
    setCtaMediaPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [ctaMediaFile]);

  const [introFile, setIntroFile] = useState<File | null>(null);
  const [outroFile, setOutroFile] = useState<File | null>(null);
  const introClipRef = useRef<HTMLInputElement>(null);
  const outroClipRef = useRef<HTMLInputElement>(null);

  const [captionTheme, setCaptionTheme] = useState<string>("Highlight");
  const [captionFontSize, setCaptionFontSize] = useState(80);
  const [captionTextColor, setCaptionTextColor] = useState("#FFFFFF");
  const [captionHighlightColor, setCaptionHighlightColor] = useState("#FFFF00");
  const [captionTextCase, setCaptionTextCase] = useState<string>("Default");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim() || "Untitled Brand Kit",
      description: description.trim() || undefined,
      primaryColor: brandColor,
    };
    if (isEdit && kitId) {
      updateBrandKit(kitId, payload);
    } else {
      saveBrandKit(payload);
    }
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-gradient-to-b from-[#0D1117] via-[#0D1117] to-[#0a0e14]">
      {/* Toolbar */}
      <div className="shrink-0 h-12 px-5 flex items-center justify-between gap-3 border-b border-border/80 bg-[#161B22]/95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm rounded-md px-2 py-1.5 -ml-2 hover:bg-white/5">
            <ChevronLeft size={18} />
            Back
          </Link>
          <span className="text-muted-foreground/40 text-sm">·</span>
          <h1 className="text-sm font-semibold text-foreground tracking-tight">{isEdit ? "Edit Brand Kit" : "Create Brand Kit"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" asChild className="h-9 rounded-lg px-4 text-sm border-border/80 hover:bg-white/5">
            <Link to="/">Cancel</Link>
          </Button>
          <Button type="submit" form="create-brand-kit-form" className="gap-2 h-9 rounded-lg px-5 text-sm shadow-sm" size="sm">
            <Briefcase size={16} />
            {isEdit ? "Save" : "Create Brand Kit"}
          </Button>
        </div>
      </div>

      <form id="create-brand-kit-form" onSubmit={handleSubmit} className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left: Section list – PC app style */}
        <aside className="w-56 shrink-0 flex flex-col border-r border-border/80 bg-[#161B22]/90">
          <div className="px-4 py-3.5 border-b border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Sections</span>
          </div>
          <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-2 space-y-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium transition-all rounded-lg",
                  activeTab === id
                    ? "bg-primary/20 text-primary shadow-sm border border-primary/30"
                    : "text-foreground/90 hover:bg-white/5 hover:text-foreground border border-transparent"
                )}
              >
                <Icon size={18} className="shrink-0 opacity-90" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main: Basic Info + active section content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-5xl p-6 space-y-8 min-h-full">
              {/* Basic Info – always visible at top */}
              <section className="rounded-xl border border-border/70 bg-[#161B22]/60 shadow-sm p-6">
                <h2 className="text-base font-semibold text-foreground tracking-tight mb-1">Basic Info</h2>
                <p className="text-xs text-muted-foreground mb-5">Name and describe this brand kit.</p>
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
              <section className="rounded-xl border border-border/70 bg-[#161B22]/60 shadow-sm p-6">
                {activeTab === "logos" && (
                  <>
                    <h2 className="text-base font-semibold text-foreground tracking-tight mb-4">Logo Assets</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Live preview — same style as CTA */}
                      <div className="lg:col-span-1 space-y-2 flex flex-col items-center">
                        <div className="flex items-center justify-between gap-2 w-full">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live preview</p>
                          <div className="flex rounded-md border border-border bg-[#0D1117] p-0.5">
                            <button
                              type="button"
                              onClick={() => setLogoPreviewAspect("16/9")}
                              className={cn(
                                "px-2 py-1 text-[11px] font-medium rounded transition-colors",
                                logoPreviewAspect === "16/9" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              16:9
                            </button>
                            <button
                              type="button"
                              onClick={() => setLogoPreviewAspect("9/16")}
                              className={cn(
                                "px-2 py-1 text-[11px] font-medium rounded transition-colors",
                                logoPreviewAspect === "9/16" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              9:16
                            </button>
                          </div>
                        </div>
                        <div
                          className={cn(
                            "w-full rounded-2xl border-2 border-border/80 bg-black relative overflow-hidden ring-1 ring-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
                            logoPreviewAspect === "9/16"
                              ? "max-w-[min(100%,280px)] aspect-[9/16]"
                              : "max-w-[min(100%,520px)] aspect-video"
                          )}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c] via-[#141414] to-[#0a0a0a]" aria-hidden />
                          {watermarkPreviewUrl && watermarkLogoFile ? (
                            <div
                              className="overflow-hidden"
                              style={getWatermarkPreviewStyle(watermarkPosition, watermarkSize)}
                            >
                              <img
                                src={watermarkPreviewUrl}
                                alt="Watermark preview"
                                className="w-full h-full object-contain"
                                style={{ opacity: watermarkOpacity / 100 }}
                              />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm text-muted-foreground/80">Upload watermark to preview</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {logoPreviewAspect === "9/16" ? "Mobile (9:16)" : "Landscape (16:9)"}
                        </p>
                      </div>

                      {/* Logo upload + watermark settings */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-foreground">Primary Logo</h3>
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
                          <h3 className="text-sm font-medium text-foreground">Watermark Logo</h3>
                          <p className="text-xs text-muted-foreground">
                            Displayed on videos. Configure position, opacity, and size.
                          </p>
                          <UploadZone
                            label={watermarkLogoFile ? watermarkLogoFile.name : "Click to upload watermark"}
                            onClick={() => watermarkLogoRef.current?.click()}
                          />
                          <input
                            ref={watermarkLogoRef}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            aria-label="Upload watermark logo"
                            onChange={(e) => setWatermarkLogoFile(e.target.files?.[0] ?? null)}
                          />
                          {watermarkLogoFile && (
                            <div className="rounded-xl border border-border/60 bg-white/[0.02] p-5 space-y-4 mt-4">
                              <h4 className="text-sm font-medium text-foreground">Watermark settings</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-muted-foreground text-xs">Position</Label>
                                  <Select value={watermarkPosition} onValueChange={setWatermarkPosition}>
                                    <SelectTrigger className="w-full bg-background/50 border-border">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {WATERMARK_POSITIONS.map((pos) => (
                                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-muted-foreground text-xs">Opacity</Label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      value={watermarkOpacity}
                                      onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                                      className="flex-1 h-2 rounded-full appearance-none bg-input accent-primary cursor-pointer"
                                    />
                                    <span className="text-xs text-muted-foreground w-10 tabular-nums">{watermarkOpacity}%</span>
                                  </div>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                  <Label className="text-muted-foreground text-xs">Size</Label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="range"
                                      min={5}
                                      max={50}
                                      value={watermarkSize}
                                      onChange={(e) => setWatermarkSize(Number(e.target.value))}
                                      className="flex-1 h-2 rounded-full appearance-none bg-input accent-primary cursor-pointer"
                                    />
                                    <span className="text-xs text-muted-foreground w-10 tabular-nums">{watermarkSize}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {activeTab === "colors" && (
                  <div className="space-y-6">
                    <h2 className="text-base font-semibold text-foreground tracking-tight mb-1">Brand Color</h2>
                    <p className="text-xs text-muted-foreground mb-4">One color for your brand. Used for highlights, CTAs, and accents.</p>

                    {/* Single color preset */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Preset</p>
                      <div className="flex flex-wrap gap-2">
                        {BRAND_COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setBrandColor(preset.hex)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                              brandColor === preset.hex
                                ? "border-primary bg-primary/15 text-primary ring-1 ring-primary/30"
                                : "border-border bg-input/20 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            )}
                          >
                            <div
                              className="w-5 h-5 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: preset.hex }}
                            />
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Single color picker */}
                    <div className="rounded-xl border border-border/60 bg-white/[0.02] p-5">
                      <Label className="text-sm font-medium text-foreground">Brand color</Label>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-3">Pick a color or paste a hex code.</p>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          className="w-12 h-12 rounded-xl border border-border/80 cursor-pointer bg-transparent shrink-0 ring-1 ring-black/20"
                        />
                        <Input
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          className="font-mono text-sm w-28 h-9 bg-background/50 border-border/80 rounded-lg"
                        />
                      </div>
                      <div
                        className="mt-3 w-full h-11 rounded-xl border border-border/60 shrink-0 shadow-inner"
                        style={{ backgroundColor: brandColor }}
                        title={brandColor}
                      />
                    </div>
                </div>
              )}
              {activeTab === "fonts" && (
                  <div className="space-y-6">
                    <h2 className="text-base font-semibold text-foreground tracking-tight mb-1">Fonts</h2>
                    <p className="text-xs text-muted-foreground mb-4">Set your brand fonts for consistent text styling.</p>

                  {/* Heading Font */}
                  <div className="space-y-4 rounded-xl border border-border/60 bg-white/[0.02] p-5">
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
                  <div className="space-y-4 rounded-xl border border-border/60 bg-white/[0.02] p-5">
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
                    <h2 className="text-base font-semibold text-foreground tracking-tight mb-1">Call to Action (CTA)</h2>
                    <p className="text-xs text-muted-foreground mb-4">Set your default CTA text and styling for videos.</p>

                    {/* Two options: Upload video/images | Custom */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCtaType("upload")}
                        className={cn(
                          "flex-1 rounded-xl border px-4 py-3.5 text-sm font-medium transition-all",
                          ctaType === "upload"
                            ? "border-primary bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20"
                            : "border-border/70 bg-white/[0.02] text-muted-foreground hover:bg-white/5 hover:text-foreground hover:border-border"
                        )}
                      >
                        Upload video or images
                      </button>
                      <button
                        type="button"
                        onClick={() => setCtaType("custom")}
                        className={cn(
                          "flex-1 rounded-xl border px-4 py-3.5 text-sm font-medium transition-all",
                          ctaType === "custom"
                            ? "border-primary bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20"
                            : "border-border/70 bg-white/[0.02] text-muted-foreground hover:bg-white/5 hover:text-foreground hover:border-border"
                        )}
                      >
                        Custom
                      </button>
                    </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Preview — real-time, realistic size; 9:16 = phone, 16:9 = landscape */}
                    <div className="lg:col-span-1 space-y-3 flex flex-col items-center">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live preview</p>
                        <div className="flex rounded-md border border-border bg-[#0D1117] p-0.5">
                          <button
                            type="button"
                            onClick={() => setCtaPreviewAspect("16/9")}
                            className={cn(
                              "px-2 py-1 text-[11px] font-medium rounded transition-colors",
                              ctaPreviewAspect === "16/9" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            16:9
                          </button>
                          <button
                            type="button"
                            onClick={() => setCtaPreviewAspect("9/16")}
                            className={cn(
                              "px-2 py-1 text-[11px] font-medium rounded transition-colors",
                              ctaPreviewAspect === "9/16" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            9:16
                          </button>
                        </div>
                      </div>
                      {/* Large, realistic frame — fills column width for real-time feel */}
                      <div
                        className={cn(
                          "w-full rounded-2xl border-2 border-border/80 bg-black flex items-end justify-center relative overflow-hidden ring-1 ring-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
                          "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
                          ctaPreviewAspect === "9/16"
                            ? "max-w-[min(100%,280px)] aspect-[9/16]"   // phone: up to 280px wide
                            : "max-w-[min(100%,520px)] aspect-video"   // landscape: up to 520px wide
                        )}
                      >
                        {/* Simulated video/content area */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c] via-[#141414] to-[#0a0a0a]" aria-hidden />
                        <div className="relative w-full h-full flex items-end justify-center p-4 min-h-0">
                          {ctaType === "custom" ? (
                            <div
                              className="px-4 py-2.5 rounded-lg transition-all shrink-0"
                              style={{
                                backgroundColor: ctaBgColor,
                                color: ctaTextColor,
                                fontSize: Math.min(ctaFontSize / 3.5, 28),
                                transform: `translate(${ctaXOffset}%, ${ctaYOffset}%)`,
                              }}
                            >
                              {ctaText}
                            </div>
                          ) : ctaMediaFile && ctaMediaPreviewUrl ? (
                            (() => {
                              const assetStyle = getCtaAssetPreviewStyle(ctaPosition, ctaAssetSize, ctaXOffset, ctaYOffset);
                              return (
                                <div
                                  className="overflow-hidden rounded-lg shrink-0"
                                  style={assetStyle}
                                >
                                  {ctaMediaFile.type.startsWith("image/") ? (
                                    <img
                                      src={ctaMediaPreviewUrl}
                                      alt="CTA preview"
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <video
                                      src={ctaMediaPreviewUrl}
                                      className="w-full h-full object-contain"
                                      muted
                                      loop
                                      playsInline
                                      autoPlay
                                    />
                                  )}
                                </div>
                              );
                            })()
                          ) : ctaMediaFile ? (
                            <span className="text-sm text-muted-foreground">Loading…</span>
                          ) : (
                            <span className="text-sm text-muted-foreground/80">Upload to preview</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {ctaPreviewAspect === "9/16" ? "Mobile (9:16)" : "Landscape (16:9)"}
                      </p>
                    </div>

                    {/* Settings — Upload or Custom */}
                    <div className="lg:col-span-2 space-y-6">
                      {ctaType === "upload" ? (
                        <>
                        <div className="space-y-4 rounded-xl border border-border/60 bg-white/[0.02] p-4">
                          <h4 className="text-sm font-medium text-foreground">Upload Videos and Images</h4>
                          <p className="text-xs text-muted-foreground">
                            Upload a video or image to use as your CTA asset.
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
                          <div className="space-y-2 pt-2 border-t border-border">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <Label className="text-muted-foreground text-xs">Blend mode for video/image</Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {ctaBlendMode === "screen" ? "Screen — lighter composite." : "Multiply — darker composite."}
                                </p>
                              </div>
                              <Switch
                                checked={ctaBlendMode === "screen"}
                                onCheckedChange={(checked) => setCtaBlendMode(checked ? "screen" : "multiply")}
                                aria-label="Screen blend on / Multiply blend off"
                                className="shrink-0"
                              />
                            </div>
                            <p className="text-[11px] text-muted-foreground">On = Screen · Off = Multiply</p>
                          </div>
                        </div>
                        {/* CTA Styling for upload: position, size, offsets */}
                        <div className="space-y-4 rounded-xl border border-border/60 bg-white/[0.02] p-4">
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
                              <Label className="text-muted-foreground text-xs">Size (%)</Label>
                              <Input
                                type="number"
                                min={10}
                                max={200}
                                value={ctaAssetSize}
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  if (!Number.isNaN(v)) setCtaAssetSize(Math.min(200, Math.max(10, v)));
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
                        </div>
                        </>
                      ) : (
                      <>
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
                        <div className="space-y-4 rounded-xl border border-border/60 bg-white/[0.02] p-4">
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
                      </>
                      )}
                    </div>
                  </div>
                  </div>
                )}
                {activeTab === "intro-outro" && (
                  <div className="space-y-6">
                    <h2 className="text-base font-semibold text-foreground tracking-tight mb-1">Intro & Outro Clips</h2>
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
                  <div className="rounded-xl border border-border/60 bg-primary/5 p-5 space-y-3 border-primary/20">
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
                    <h2 className="text-base font-semibold text-foreground tracking-tight mb-1">Caption Style</h2>
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
        "w-full min-h-[120px] rounded-xl border-2 border-dashed border-border/70 bg-white/[0.02]",
        "flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground",
        "hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm transition-all duration-200"
      )}
    >
      <Upload size={28} className="opacity-70" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
